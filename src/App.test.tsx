import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { App } from './App';
import { STORAGE_KEY } from './state/storage';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.open = true;
  });
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.open = false;
  });
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      employees: [
        {
          id: '1',
          name: 'Pessoa fictícia',
          cpf: '52998224725',
          grossSalaryCents: 500000,
          socialSecurityCents: 50000,
          dependents: 2,
        },
      ],
    }),
  );
});

it('cancela a exclusão e só remove após confirmação', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Excluir Pessoa fictícia' }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByText('Pessoa fictícia')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Excluir Pessoa fictícia' }));
  await user.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  expect(screen.queryByText('Pessoa fictícia')).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).employees).toEqual([]);
});

it('fecha o formulário por Escape sem alterar o registro', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Editar Pessoa fictícia' }));
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Pessoa fictícia')).toBeVisible();
});
