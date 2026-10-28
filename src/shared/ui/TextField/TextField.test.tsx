import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { TextField } from './TextField';

it('associa rótulo, ajuda e erro preservando descrições do consumidor', () => {
  const content = (error?: string) => (
    <>
      <p id="external-help">Ajuda adicional.</p>
      <TextField
        label="Valor"
        id="amount"
        hint="Use duas casas decimais."
        error={error}
        aria-describedby="external-help amount-hint"
      />
    </>
  );
  const { rerender } = render(content());
  const input = screen.getByLabelText('Valor');
  expect(input).toHaveAccessibleDescription('Ajuda adicional. Use duas casas decimais.');
  rerender(content('Informe um valor válido.'));
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription(
    'Ajuda adicional. Use duas casas decimais. Informe um valor válido.',
  );
  expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual([
    'external-help',
    'amount-hint',
    'amount-error',
  ]);
  rerender(content());
  expect(input).not.toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Ajuda adicional. Use duas casas decimais.');
});

it('gera identificadores distintos e encaminha referência e eventos do input', async () => {
  const ref = createRef<HTMLInputElement>();
  const change = vi.fn();
  render(
    <>
      <TextField label="Primeiro" ref={ref} onChange={change} required maxLength={3} />
      <TextField label="Segundo" />
    </>,
  );
  const first = screen.getByLabelText('Primeiro');
  const second = screen.getByLabelText('Segundo');
  expect(first.id).not.toBe(second.id);
  expect(ref.current).toBe(first);
  await userEvent.type(first, 'abcd');
  expect(first).toHaveValue('abc');
  expect(change).toHaveBeenCalledTimes(3);
  expect(first).toBeRequired();
});
