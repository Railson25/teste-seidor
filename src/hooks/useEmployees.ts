import { useContext } from 'react';
import { EmployeesContext, EmployeeActionsContext } from '../contexts/EmployeesContext';

export function useEmployees() {
  const context = useContext(EmployeesContext);
  if (!context) throw new Error('EmployeesProvider ausente.');
  return context;
}

export function useEmployeeActions() {
  const context = useContext(EmployeeActionsContext);
  if (!context) throw new Error('EmployeesProvider ausente.');
  return context;
}
