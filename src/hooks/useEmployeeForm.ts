import { useId, useState } from 'react';
import type { SubmitEvent } from 'react';
import type {
  Employee,
  EmployeeErrors,
  EmployeeFormValues,
  EmployeeInput,
} from '../types/employee';
import { validateEmployee } from '../domain/employee';
import { createEmployeeFormValues, toEmployeeInput } from '../helpers/employeeForm';

export function useEmployeeForm(
  employee: Employee | undefined,
  employees: readonly Employee[],
  onSave: (input: EmployeeInput) => void,
) {
  const prefix = useId();
  const [values, setValues] = useState(() => createEmployeeFormValues(employee));
  const [errors, setErrors] = useState<EmployeeErrors>({});

  function updateField(key: keyof EmployeeFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = toEmployeeInput(values);
    const nextErrors = validateEmployee(input, employees, employee?.id);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) document.getElementById(`${prefix}-${first}`)?.focus();
    else onSave(input);
  }

  return { prefix, values, errors, updateField, submit };
}
