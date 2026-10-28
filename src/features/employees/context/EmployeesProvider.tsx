import { useCallback, useMemo, useReducer, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Employee, EmployeeAction } from '../types/employee';
import { employeeReducer } from './employeesReducer';
import { readEmployees, writeEmployees } from '../storage/employeeStorage';
import { EmployeesContext, EmployeeActionsContext } from './EmployeesContext';

export function EmployeesProvider({ children }: PropsWithChildren) {
  const [initial] = useState(readEmployees);
  const [employees, dispatch] = useReducer(employeeReducer, initial.employees);
  const [warning, setWarning] = useState(initial.warning);
  const currentEmployees = useRef<readonly Employee[]>(initial.employees);
  const storageBlocked = useRef(initial.blocked);

  const commit = useCallback((action: EmployeeAction) => {
    // Event actions may be batched before React renders the updated state.
    const next = employeeReducer(currentEmployees.current, action);
    currentEmployees.current = next;
    if (!storageBlocked.current) setWarning(writeEmployees(next));
    dispatch(action);
  }, []);

  const resetStorage = useCallback(() => {
    const error = writeEmployees(currentEmployees.current);
    setWarning(error);
    storageBlocked.current = Boolean(error);
  }, []);

  const actions = useMemo(
    () => ({ commit, warning, resetStorage }),
    [commit, warning, resetStorage],
  );
  return (
    <EmployeesContext value={employees}>
      <EmployeeActionsContext value={actions}>{children}</EmployeeActionsContext>
    </EmployeesContext>
  );
}
