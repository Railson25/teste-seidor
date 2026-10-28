import { isEmployee } from '../helpers/employeeValidation';
import type { Employee } from '../types/employee';
import type { StorageSnapshot } from '../types/storage';
import { STORAGE_KEY, STORAGE_VERSION } from '../constants/storage';

export function readEmployees(): StorageSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { employees: [], warning: '', blocked: false };
    const data: unknown = JSON.parse(raw);
    if (
      !data ||
      typeof data !== 'object' ||
      !('version' in data) ||
      data.version !== STORAGE_VERSION ||
      !('employees' in data) ||
      !Array.isArray(data.employees)
    )
      throw new Error();
    const employees: unknown[] = data.employees;
    if (
      !employees.every(isEmployee) ||
      new Set(employees.map((item) => item.id)).size !== employees.length ||
      new Set(employees.map((item) => item.cpf)).size !== employees.length
    )
      throw new Error();
    return { employees, warning: '', blocked: false };
  } catch {
    return {
      employees: [],
      warning:
        'Não foi possível recuperar os dados salvos. Novas alterações ficarão apenas nesta sessão até você redefinir o armazenamento.',
      blocked: true,
    };
  }
}

export function writeEmployees(employees: readonly Employee[]): string {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, employees }));
    return '';
  } catch {
    return 'Não foi possível salvar neste navegador. As alterações estão disponíveis apenas nesta sessão; mantenha esta aba aberta.';
  }
}
