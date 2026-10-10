import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import useResponsiveDialog from "../../hooks/useResponsiveDialog";

export default function ModuleForm({
  children, title, description, isFormOpen, onClose, formSectionRef,
  titleInputRef, submitting, error, confirmDiscard, attachment,
}) {
  const titleId = useId();
  const errorRef = useRef(null);
  const compact = useResponsiveDialog(formSectionRef, isFormOpen, titleInputRef);

  useEffect(() => {
    if (error && isFormOpen) {
      errorRef.current?.focus({ preventScroll: true });
      errorRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [error, isFormOpen]);

  useEffect(() => {
    if (!attachment) {
      const upload = formSectionRef.current.querySelector('input[type="file"]');
      if (upload) upload.value = "";
    }
  }, [attachment, formSectionRef]);

  useEffect(() => {
    // Associate existing module labels without changing their fields or validation.
    const dialog = formSectionRef.current;
    for (const control of dialog.querySelectorAll("input, select, textarea")) {
      const label = [...control.parentElement.children].find(node => node.tagName === "LABEL");
      if (label && !label.htmlFor) {
        control.id ||= `${titleId}-${control.name || control.type}`;
        label.htmlFor = control.id;
      }
    }
  });

  return (
    <dialog
      ref={formSectionRef}
      className="module-form"
      role={compact ? "dialog" : "region"}
      aria-modal={compact && isFormOpen ? true : undefined}
      aria-labelledby={titleId}
      aria-busy={submitting}
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting) onClose();
      }}
      onClickCapture={(event) => {
        const button = event.target.closest("button[data-reset-form]");
        if (button && !confirmDiscard()) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || !compact || submitting) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <button type="button" onClick={onClose} disabled={submitting}
          aria-label={`Close ${title.toLowerCase()} form`}
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden">
          <X size={20} />
        </button>
      </div>
      {error && <p ref={errorRef} tabIndex={-1} role="alert" className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
      <fieldset disabled={submitting} className="m-0 min-w-0 border-0 p-0">{children}</fieldset>
    </dialog>
  );
}
