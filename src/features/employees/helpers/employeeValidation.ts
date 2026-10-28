import { MAX_DEPENDENTS, MAX_MONEY_CENTS, MAX_NAME_LENGTH } from '../constants/employee';
import type { Employee, EmployeeErrors, EmployeeInput } from '../types/employee';

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const length of [9, 10]) {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(cpf[index]) * (length + 1 - index);
    const digit = (sum * 10) % 11;
    if ((digit === 10 ? 0 : digit) !== Number(cpf[length])) return false;
  }
  return true;
}

export function validateEmployee(
  input: EmployeeInput,
  employees: readonly Employee[] = [],
  editingId?: string,
): EmployeeErrors {
  const errors: EmployeeErrors = {};
  if (!input.name.trim() || input.name.trim().length > MAX_NAME_LENGTH)
    errors.name = `Informe um nome com até ${MAX_NAME_LENGTH} caracteres.`;
  if (!isValidCpf(input.cpf)) errors.cpf = 'Informe um CPF válido.';
  else if (employees.some((employee) => employee.cpf === input.cpf && employee.id !== editingId))
    errors.cpf = 'Este CPF já está cadastrado.';
  for (const key of ['grossSalaryCents', 'socialSecurityCents'] as const) {
    if (!Number.isSafeInteger(input[key]) || input[key] < 0 || input[key] > MAX_MONEY_CENTS)
      errors[key] = 'Informe um valor entre R$ 0,00 e R$ 999.999.999,99.';
  }
  if (!errors.socialSecurityCents && input.socialSecurityCents > input.grossSalaryCents)
    errors.socialSecurityCents = 'A previdência não pode ultrapassar o salário bruto.';
  if (
    !Number.isSafeInteger(input.dependents) ||
    input.dependents < 0 ||
    input.dependents > MAX_DEPENDENTS
  )
    errors.dependents = 'Informe uma quantidade inteira e não negativa.';
  return errors;
}

export function isEmployee(value: unknown): value is Employee {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    item.id.length <= 100 &&
    typeof item.name === 'string' &&
    typeof item.cpf === 'string' &&
    typeof item.grossSalaryCents === 'number' &&
    typeof item.socialSecurityCents === 'number' &&
    typeof item.dependents === 'number' &&
    Object.keys(validateEmployee(item as unknown as Employee)).length === 0
  );
}
