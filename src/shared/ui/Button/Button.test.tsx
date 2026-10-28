import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button } from './Button';

it('evita submissão implícita e encaminha referência e atributos nativos', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  const ref = createRef<HTMLButtonElement>();
  render(
    <form onSubmit={submit}>
      <Button ref={ref} aria-label="Abrir formulário" name="action" value="open">
        Abrir
      </Button>
    </form>,
  );
  const button = screen.getByRole('button', { name: 'Abrir formulário' });
  await userEvent.click(button);
  expect(submit).not.toHaveBeenCalled();
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute('name', 'action');
  expect(button).toHaveAttribute('value', 'open');
});

it('permite submissão explícita e respeita disabled', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  const { rerender } = render(
    <form onSubmit={submit}>
      <Button type="submit">Salvar</Button>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  expect(submit).toHaveBeenCalledOnce();
  rerender(
    <form onSubmit={submit}>
      <Button type="submit" disabled>
        Salvar
      </Button>
    </form>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  expect(submit).toHaveBeenCalledOnce();
});
