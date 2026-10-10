import { useEffect, useRef, useState } from "react";

export default function useResponsiveDialog(dialogRef, isOpen, focusRef, alwaysModal = false) {
  const mode = useRef(null);
  const [compact, setCompact] = useState(() => alwaysModal || window.innerWidth < 1024);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(alwaysModal || media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [alwaysModal]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (mode.current !== compact && dialog.open) dialog.close();
    mode.current = compact;
    if (!compact) {
      dialog.setAttribute("open", "");
    } else if (isOpen && !dialog.open) {
      dialog.showModal();
      focusRef?.current?.focus({ preventScroll: true });
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [compact, isOpen, dialogRef, focusRef]);

  useEffect(() => {
    if (!compact || !isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [compact, isOpen]);

  return compact;
}
