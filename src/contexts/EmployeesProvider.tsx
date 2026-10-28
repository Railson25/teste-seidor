import { useCallback, useMemo, useReducer, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { EmployeeAction } from '../types/employee';
import { employeeReducer } from './employeesReducer';
import { readEmployees, writeEmployees } from '../services/employeeStorage';
import { EmployeesContext, EmployeeActionsContext } from './EmployeesContext';

export function EmployeesProvider({ children }: PropsWithChildren) {
  const [initial] = useState(readEmployees);
  const [employees, dispatch] = useReducer(employeeReducer, initial.employees);
  const [warning, setWarning] = useState(initial.warning);
  const [blocked, setBlocked] = useState(initial.blocked);

  const commit = useCallback(
    (action: EmployeeAction) => {
      const next = employeeReducer(employees, action);
      if (!blocked) setWarning(writeEmployees(next));
      dispatch(action);
    },
    [employees, blocked],
  );

  const resetStorage = useCallback(() => {
    const error = writeEmployees(employees);
    setWarning(error);
    setBlocked(Boolean(error));
  }, [employees]);

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
