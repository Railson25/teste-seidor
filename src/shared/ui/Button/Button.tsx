import type { ComponentProps } from 'react';
import styles from './Button.module.css';

interface Props extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'text' | 'dangerText' | 'icon';
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: Props) {
  return (
    <button
      {...props}
      type={type}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
    />
  );
}
