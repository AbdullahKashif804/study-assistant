import { useRef } from "react";
import useResponsiveDialog from "../../hooks/useResponsiveDialog";

export default function Modal({ children, title, onClose }) {
  const dialogRef = useRef(null);
  useResponsiveDialog(dialogRef, true, undefined, true);
  return (
    <dialog ref={dialogRef} className="app-modal" aria-label={title} aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      {children}
    </dialog>
  );
}
