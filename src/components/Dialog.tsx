import { useEffect, useId, useRef } from 'react';
import type { PropsWithChildren } from 'react';

export function Dialog({ title, onClose, children }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
      else document.getElementById('new-employee')?.focus();
    };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const controls = ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="dialogHeader"><h2 id={titleId}>{title}</h2><button type="button" className="iconButton" aria-label="Fechar diálogo" onClick={onClose}>×</button></div>
    {children}
  </dialog>;
}
