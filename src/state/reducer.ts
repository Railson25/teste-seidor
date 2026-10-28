import { validateEmployee } from '../domain/employee';
import type { Employee } from '../domain/employee';

export type EmployeeAction =
  | { type: 'save'; employee: Employee }
  | { type: 'remove'; id: string }
  | { type: 'import'; employees: readonly Employee[] };

export function employeeReducer(
  state: readonly Employee[],
  action: EmployeeAction,
): readonly Employee[] {
  switch (action.type) {
    case 'save': {
      if (Object.keys(validateEmployee(action.employee, state, action.employee.id)).length)
        return state;
      return state.some((item) => item.id === action.employee.id)
        ? state.map((item) => (item.id === action.employee.id ? action.employee : item))
        : [...state, action.employee];
    }
    case 'remove':
      return state.filter((item) => item.id !== action.id);
    case 'import':
      return action.employees.reduce<readonly Employee[]>((current, employee) => {
        if (current.some((item) => item.id === employee.id || item.cpf === employee.cpf))
          return current;
        return employeeReducer(current, { type: 'save', employee });
      }, state);
  }
}
