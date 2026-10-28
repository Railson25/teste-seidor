import type { ComponentProps } from 'react';
import styles from './FeedbackMessage.module.css';

interface Props extends Omit<ComponentProps<'div'>, 'role'> {
  variant: 'success' | 'warning' | 'error';
}

export function FeedbackMessage({ variant, className, children, ...props }: Props) {
  const hidden =
    variant === 'success' && (children == null || children === '' || children === false);
  return (
    <div
      {...props}
      role={variant === 'success' ? 'status' : 'alert'}
      className={hidden ? 'srOnly' : [styles[variant], className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
