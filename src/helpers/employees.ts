import type { Employee, EmployeeSummary } from '../types/employee';
import { normalizeCpf } from '../domain/employee';
import { calculateIrrf } from '../domain/irrf';
import { normalizeText } from '../utils/text';

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
