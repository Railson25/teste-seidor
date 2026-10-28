import type { ComponentProps, ReactNode } from 'react';
import { Dialog } from '../Dialog/Dialog';
import { Button } from '../Button/Button';
import styles from './ConfirmDialog.module.css';

interface Props extends Omit<ComponentProps<typeof Dialog>, 'children' | 'onClose'> {
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  children,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  ...props
}: Props) {
  return (
    <Dialog {...props} onClose={onCancel}>
      {children}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
