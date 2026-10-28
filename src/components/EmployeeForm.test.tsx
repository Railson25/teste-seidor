import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { EmployeeForm } from './EmployeeForm';

it('valida campos e envia valores em centavos', async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<EmployeeForm employee={undefined} employees={[]} onSave={onSave} onCancel={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.getByLabelText('Nome')).toHaveFocus();
  await user.type(screen.getByLabelText('Nome'), 'Exemplo fictício');
  await user.type(screen.getByLabelText('CPF'), '529.982.247-25');
  await user.type(screen.getByLabelText('Salário bruto (R$)'), '5000,29');
  await user.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
  expect(onSave).toHaveBeenCalledWith({ name: 'Exemplo fictício', cpf: '52998224725', grossSalaryCents: 500029, socialSecurityCents: 0, dependents: 0 });
});

it('preenche a edição e permite cancelar sem salvar', async () => {
  const onCancel = vi.fn();
  render(<EmployeeForm employee={{ id: '1', name: 'Exemplo', cpf: '52998224725', grossSalaryCents: 500000, socialSecurityCents: 50000, dependents: 2 }} employees={[]} onSave={vi.fn()} onCancel={onCancel} />);
  expect(screen.getByLabelText('Salário bruto (R$)')).toHaveValue('5000,00');
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(onCancel).toHaveBeenCalledOnce();
});
