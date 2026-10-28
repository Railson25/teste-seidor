import { createContext } from 'react';
import type { Employee, EmployeeActions } from '../types/employee';

export const EmployeesContext = createContext<readonly Employee[] | null>(null);
export const EmployeeActionsContext = createContext<EmployeeActions | null>(null);
