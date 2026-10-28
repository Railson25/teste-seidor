import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Employee } from '../domain/employee';
import { employeeReducer } from './reducer';
import type { EmployeeAction } from './reducer';
import { readEmployees, writeEmployees } from './storage';

const EmployeesContext = createContext<readonly Employee[] | null>(null);
const ActionsContext = createContext<{
  commit: (action: EmployeeAction) => void;
  warning: string;
  resetStorage: () => void;
} | null>(null);

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
      <ActionsContext value={actions}>{children}</ActionsContext>
    </EmployeesContext>
  );
}

export function useEmployees() {
  const context = useContext(EmployeesContext);
  if (!context) throw new Error('EmployeesProvider ausente.');
  return context;
}

export function useEmployeeActions() {
  const context = useContext(ActionsContext);
  if (!context) throw new Error('EmployeesProvider ausente.');
  return context;
}
