import type { Employee, EmployeeFormValues, EmployeeInput } from '../types/employee';
import { normalizeCpf } from '../domain/employee';
import { moneyToInput, parseMoney } from '../utils/format';

export function createEmployeeFormValues(employee?: Employee): EmployeeFormValues {
  return {
    name: employee?.name ?? '',
    cpf: employee?.cpf ?? '',
    grossSalaryCents: employee ? moneyToInput(employee.grossSalaryCents) : '',
    socialSecurityCents: employee ? moneyToInput(employee.socialSecurityCents) : '0,00',
    dependents: String(employee?.dependents ?? 0),
  };
}

export function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  return {
    name: values.name.trim(),
    cpf: normalizeCpf(values.cpf),
    grossSalaryCents: parseMoney(values.grossSalaryCents),
    socialSecurityCents: parseMoney(values.socialSecurityCents),
    dependents: /^\d+$/.test(values.dependents) ? Number(values.dependents) : NaN,
  };
}
