import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Exercise hook lifecycles with mocked browser APIs; no DOM/device testing implied.
function harness(file, name, globals = {}) {
  const slots = [];
  const effects = [];
  let cursor = 0;
  let pending = [];
  const context = vm.createContext({
    URL, ...globals,
    useRef(value) { const index = cursor++; return slots[index] ||= { current: value }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useEffect(callback, dependencies) {
      const index = cursor++;
      const previous = effects[index];
      if (!previous || !dependencies || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        pending.push(() => {
          previous?.cleanup?.();
          effects[index] = { dependencies, cleanup: callback() };
        });
      }
    },
  });
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8")
    .replace(/^import[^\n]*\n/gm, "").replace("export default function", "function");
  vm.runInContext(source, context);
  return {
    render(...args) {
      cursor = 0; pending = [];
      const result = context[name](...args);
      pending.forEach(effect => effect());
      return result;
    },
    unmount() { effects.forEach(effect => effect?.cleanup?.()); },
  };
}

function browser(width = 1024) {
  const windowListeners = new Map();
  const documentListeners = new Map();
  const mediaListeners = new Set();
  const media = { matches: width < 1024,
    addEventListener: (_, fn) => mediaListeners.add(fn),
    removeEventListener: (_, fn) => mediaListeners.delete(fn) };
  const window = { innerWidth: width, matchMedia: () => media,
    confirm: () => false, location: { href: "http://study.test/notes", origin: "http://study.test", pathname: "/notes" },
    addEventListener: (type, fn) => windowListeners.set(type, fn),
    removeEventListener: type => windowListeners.delete(type) };
  const document = { body: { style: { overflow: "auto" } },
    addEventListener: (type, fn) => documentListeners.set(type, fn),
    removeEventListener: type => documentListeners.delete(type) };
  return { window, document, windowListeners, documentListeners,
    resize(width) { window.innerWidth = width; media.matches = width < 1024; mediaListeners.forEach(fn => fn()); } };
}

test("draft guard protects changed fields and attachments, then accepts an explicit discard", () => {
  const env = browser();
  const hook = harness("../src/hooks/useFormDraft.js", "useFormDraft", env);
  const empty = { title: "", content: "", course: "" };
  hook.render(empty, null, empty);
  const draft = { ...empty, title: "Unsaved note" };
  let confirm = hook.render(draft, null, empty);
  assert.equal(confirm(), false);
  assert.ok(env.windowListeners.has("beforeunload"));
  env.window.confirm = () => true;
  assert.equal(confirm(), true);
  hook.render(empty, null, empty);
  assert.equal(env.windowListeners.has("beforeunload"), false);
  env.window.confirm = () => false;
  confirm = hook.render(empty, { name: "notes.pdf", size: 42, lastModified: 1 }, empty);
  assert.equal(confirm(), false);
  hook.unmount();
  assert.equal(env.documentListeners.has("click"), false);
});

test("profile semester defaults are clean; manual semester edits are guarded", () => {
  const env = browser();
  const hook = harness("../src/hooks/useFormDraft.js", "useFormDraft", env);
  const empty = { title: "", semester: "", description: "" };
  hook.render(empty, null, empty);
  const defaults = { ...empty, semester: 3 };
  hook.render(defaults, null, defaults);
  assert.equal(env.windowListeners.has("beforeunload"), false);
  const draft = { ...empty, semester: 3, title: "Algorithms" };
  let confirm = hook.render(draft, null, defaults);
  assert.equal(confirm(), false);
  env.window.confirm = () => true;
  confirm();
  hook.render(draft, null, defaults);
  env.window.confirm = () => false;
  confirm = hook.render({ ...draft, semester: 2 }, null, defaults);
  assert.equal(confirm(), false);
});

test("ordinary sidebar navigation can be cancelled without discarding a draft", () => {
  const env = browser();
  const hook = harness("../src/hooks/useFormDraft.js", "useFormDraft", env);
  const empty = { title: "" };
  hook.render(empty, null, empty);
  hook.render({ title: "Draft" }, null, empty);
  let prevented = false;
  const link = { href: "http://study.test/courses", target: "", hasAttribute: () => false };
  env.documentListeners.get("click")({ target: { closest: () => link },
    preventDefault: () => { prevented = true; }, stopPropagation() {} });
  assert.equal(prevented, true);
});

test("supported browser Back/Forward can be cancelled, accepted, and cleaned up", () => {
  const env = browser();
  const listeners = new Map();
  env.window.navigation = {
    addEventListener: (type, fn) => listeners.set(type, fn),
    removeEventListener: type => listeners.delete(type),
  };
  const hook = harness("../src/hooks/useFormDraft.js", "useFormDraft", env);
  const empty = { title: "" };
  hook.render(empty, null, empty);
  assert.equal(listeners.has("navigate"), false);
  hook.render({ title: "Draft" }, null, empty);
  let prevented = false;
  const event = {
    navigationType: "traverse", cancelable: true,
    destination: { url: "http://study.test/dashboard", sameDocument: true },
    preventDefault: () => { prevented = true; },
  };
  listeners.get("navigate")(event);
  assert.equal(prevented, true);
  env.window.confirm = () => true;
  prevented = false;
  listeners.get("navigate")(event);
  assert.equal(prevented, false);
  env.window.confirm = () => { throw new Error("Unnecessary prompt"); };
  listeners.get("navigate")({ ...event, navigationType: "push" });
  listeners.get("navigate")({ ...event, cancelable: false });
  listeners.get("navigate")({ ...event, destination: { ...event.destination, sameDocument: false } });
  listeners.get("navigate")({ ...event, destination: { url: "http://study.test/notes#section", sameDocument: true } });
  hook.unmount();
  assert.equal(listeners.has("navigate"), false);
});

for (const width of [375, 768, 1023]) {
  test(`compact dialogs at ${width}px hide until opened, focus fields, and restore scrolling`, () => {
    const env = browser(width);
    let focused = 0;
    const dialog = { open: false, close() { this.open = false; },
      showModal() { this.open = true; }, setAttribute() { this.open = true; } };
    const ref = { current: dialog };
    const focus = { current: { focus() { focused++; } } };
    const hook = harness("../src/hooks/useResponsiveDialog.js", "useResponsiveDialog", env);
    assert.equal(hook.render(ref, false, focus), true);
    assert.equal(dialog.open, false);
    hook.render(ref, true, focus);
    assert.equal(dialog.open, true);
    assert.equal(focused, 1);
    assert.equal(env.document.body.style.overflow, "hidden");
    hook.render(ref, false, focus);
    assert.equal(dialog.open, false);
    assert.equal(env.document.body.style.overflow, "auto");
    hook.unmount();
  });
}

test("desktop forms are non-modal at 1024px and switch modes without replacing their element", () => {
  const env = browser(1024);
  let focused = 0;
  const dialog = { open: false, close() { this.open = false; },
    showModal() { this.open = true; }, setAttribute() { this.open = true; } };
  const ref = { current: dialog };
  const focus = { current: { focus() { focused++; } } };
  const hook = harness("../src/hooks/useResponsiveDialog.js", "useResponsiveDialog", env);
  assert.equal(hook.render(ref, false, focus), false);
  assert.equal(dialog.open, true);
  assert.equal(focused, 0);
  env.resize(900);
  assert.equal(hook.render(ref, false, focus), true);
  assert.equal(dialog.open, false);
  hook.render(ref, true, focus);
  env.resize(1280);
  hook.render(ref, true, focus);
  assert.equal(ref.current, dialog);
  assert.equal(dialog.open, true);
  assert.equal(env.document.body.style.overflow, "auto");
  hook.unmount();
});

test("specialized AI/deadline dialogs remain modal on desktop", () => {
  const env = browser(1440);
  let modal = false;
  const dialog = { open: false, close() { this.open = false; },
    showModal() { this.open = true; modal = true; }, setAttribute() { this.open = true; } };
  const hook = harness("../src/hooks/useResponsiveDialog.js", "useResponsiveDialog", env);
  assert.equal(hook.render({ current: dialog }, true, undefined, true), true);
  assert.equal(modal, true);
  hook.unmount();
});

test("pagination normalizes empty results and requests a valid page after totals shrink", () => {
  const source = fs.readFileSync(new URL("../src/components/ui/Pagination.jsx", import.meta.url), "utf8");
  const start = source.indexOf("export default function");
  const end = source.indexOf("  return (", start);
  const calculation = source.slice(start, end).replace("export default function", "function") + "return {page, pages}; }";
  const context = vm.createContext({ useEffect: callback => callback() });
  vm.runInContext(calculation, context);
  const calls = [];
  const empty = context.Pagination({ currentPage: 1, totalPages: 0, totalItems: 0, setCurrentPage: page => calls.push(page) });
  assert.equal(empty.page, 1);
  assert.equal(empty.pages, 1);
  const shrunk = context.Pagination({ currentPage: 4, totalPages: 2, totalItems: 10, setCurrentPage: page => calls.push(page) });
  assert.equal(shrunk.page, 2);
  assert.deepEqual(calls, [2]);
});
