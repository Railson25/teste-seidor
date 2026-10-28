import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

it('encaminha confirmação e cancelamento sem executar ações de negócio', async () => {
  const confirm = vi.fn(),
    cancel = vi.fn();
  render(
    <ConfirmDialog
      title="Confirmar ação"
      confirmLabel="Confirmar"
      onConfirm={confirm}
      onCancel={cancel}
    >
      <p>Confira antes de continuar.</p>
    </ConfirmDialog>,
  );
  expect(screen.getByRole('dialog', { name: 'Confirmar ação' })).toHaveTextContent(
    'Confira antes de continuar.',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(cancel).toHaveBeenCalledOnce();
  expect(confirm).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
  expect(confirm).toHaveBeenCalledOnce();
});

it('trata Escape e o botão fechar como cancelamento', async () => {
  const confirm = vi.fn(),
    cancel = vi.fn();
  render(
    <ConfirmDialog
      title="Confirmar ação"
      confirmLabel="Confirmar"
      onConfirm={confirm}
      onCancel={cancel}
    >
      Descrição.
    </ConfirmDialog>,
  );
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  await userEvent.click(screen.getByRole('button', { name: 'Fechar diálogo' }));
  expect(cancel).toHaveBeenCalledTimes(2);
  expect(confirm).not.toHaveBeenCalled();
});
