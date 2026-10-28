import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { EmployeeTable } from './EmployeeTable';

const employee = { id: '1', name: 'Ágata Exemplo', cpf: '52998224725', grossSalaryCents: 500000, socialSecurityCents: 50000, dependents: 2 };

it('combina filtros, ignora acentos e aceita CPF formatado', async () => {
  const user = userEvent.setup();
  render(<EmployeeTable employees={[employee]} onEdit={vi.fn()} />);
  expect(screen.getByText(/264,41/)).toBeVisible();
  await user.type(screen.getByLabelText('Buscar por nome'), 'AGATA');
  await user.type(screen.getByLabelText('Filtrar por CPF'), '529.982');
  expect(screen.getByText(employee.name)).toBeVisible();
  await user.type(screen.getByLabelText('Filtrar por CPF'), '0');
  expect(screen.getByText('Nenhum resultado encontrado')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
  expect(screen.getByText(employee.name)).toBeVisible();
});

it('pagina e ajusta a página quando a lista encolhe', async () => {
  const rows = Array.from({ length: 11 }, (_, index) => ({ ...employee, id: String(index), name: `Pessoa ${index}` }));
  const { rerender } = render(<EmployeeTable employees={rows} onEdit={vi.fn()} />);
  expect(screen.queryByText('Pessoa 10')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
  expect(screen.getByText('Pessoa 10')).toBeVisible();
  rerender(<EmployeeTable employees={rows.slice(0, 10)} onEdit={vi.fn()} />);
  expect(screen.getByText('Pessoa 0')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
});
