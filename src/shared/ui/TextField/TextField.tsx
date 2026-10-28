import { useId } from 'react';
import type { ComponentProps } from 'react';
import styles from './TextField.module.css';

interface Props extends ComponentProps<'input'> {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  containerClassName?: string | undefined;
}

export function TextField({
  id,
  label,
  hint,
  error,
  containerClassName,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: Props) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const descriptions =
    [
      ...new Set(
        [
          ...(describedBy?.split(/\s+/) ?? []),
          hint ? `${fieldId}-hint` : '',
          error ? `${fieldId}-error` : '',
        ].filter(Boolean),
      ),
    ].join(' ') || undefined;

  return (
    <div className={containerClassName}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <input
        {...props}
        id={fieldId}
        className={[styles.input, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : invalid}
        aria-describedby={descriptions}
      />
      {hint && (
        <small className={styles.hint} id={`${fieldId}-hint`}>
          {hint}
        </small>
      )}
      {error && (
        <p className={styles.error} id={`${fieldId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
