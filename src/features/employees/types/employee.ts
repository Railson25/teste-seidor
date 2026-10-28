export interface Employee {
  id: string;
  name: string;
  cpf: string;
  grossSalaryCents: number;
  socialSecurityCents: number;
  dependents: number;
}

export type EmployeeInput = Omit<Employee, 'id'>;
export type EmployeeErrors = Partial<Record<keyof EmployeeInput, string>>;
export type EmployeeFormValues = Record<keyof EmployeeInput, string>;

export type EmployeeAction =
  | { type: 'save'; employee: Employee }
  | { type: 'remove'; id: string }
  | { type: 'import'; employees: readonly Employee[] };

export interface EmployeeActions {
  commit: (action: EmployeeAction) => void;
  warning: string;
  resetStorage: () => void;
}

export interface EmployeeSummary {
  grossCents: number;
  taxCents: number;
}
