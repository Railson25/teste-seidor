import type { Employee, EmployeeSummary } from '../types/employee';
import { normalizeCpf } from './employeeValidation';
import { calculateIrrf } from './irrf';
import { normalizeText } from '../../../shared/utils/text';

export function filterEmployees(
  employees: readonly Employee[],
  name: string,
  cpf: string,
): readonly Employee[] {
  const queryName = normalizeText(name.trim());
  const queryCpf = normalizeCpf(cpf);
  return employees.filter(
    (employee) =>
      normalizeText(employee.name).includes(queryName) && employee.cpf.includes(queryCpf),
  );
}

export function summarizeEmployees(employees: readonly Employee[]): EmployeeSummary {
  return employees.reduce(
    (sum, employee) => ({
      grossCents: sum.grossCents + employee.grossSalaryCents,
      taxCents: sum.taxCents + calculateIrrf(employee).taxCents,
    }),
    { grossCents: 0, taxCents: 0 },
  );
}

export const formatCpf = (cpf: string) =>
  cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
