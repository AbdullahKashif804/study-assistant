import { useEffect, useRef } from "react";

const serialize = (form, attachment) => JSON.stringify([form,
  attachment ? [attachment.name, attachment.size, attachment.lastModified] : null]);

export default function useFormDraft(form, attachment, emptyForm) {
  const baseline = useRef(serialize(form, attachment));
  const empty = !attachment && Object.keys(emptyForm).every(key =>
    form[key] === emptyForm[key]);
  const current = serialize(form, attachment);
  const dirty = !empty && baseline.current !== null && baseline.current !== current;

  useEffect(() => {
    if (empty || baseline.current === null) baseline.current = current;
  });

  useEffect(() => {
    if (!dirty) return;
    const preventLoss = event => { event.preventDefault(); event.returnValue = ""; };
    const guardNavigation = event => {
      const link = event.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download") ||
          event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin ||
          destination.pathname === window.location.pathname) return;
      if (!window.confirm("Leave this page and discard unsaved form changes?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    // BrowserRouter does not expose a route blocker. Where available, the
    // Navigation API lets us cancel Back/Forward before React loses the draft.
    // Other navigations remain covered by the link and beforeunload guards.
    const guardTraversal = event => {
      if (event.navigationType !== "traverse" || !event.cancelable || !event.destination.sameDocument) return;
      const destination = new URL(event.destination.url);
      if (destination.pathname === window.location.pathname) return;
      if (!window.confirm("Leave this page and discard unsaved form changes?")) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", preventLoss);
    document.addEventListener("click", guardNavigation, true);
    window.navigation?.addEventListener("navigate", guardTraversal);
    return () => {
      window.removeEventListener("beforeunload", preventLoss);
      document.removeEventListener("click", guardNavigation, true);
      window.navigation?.removeEventListener("navigate", guardTraversal);
    };
  }, [dirty]);

  return function confirmDiscard() {
    if (dirty && !window.confirm("Discard unsaved form changes?")) return false;
    baseline.current = null;
    return true;
  };
}
