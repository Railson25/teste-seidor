import { describe, expect, it } from 'vitest';
import { employeeReducer } from './employeesReducer';
import type { Employee } from '../types/employee';

const employee: Employee = {
  id: '1',
  name: 'Exemplo',
  cpf: '52998224725',
  grossSalaryCents: 500000,
  socialSecurityCents: 50000,
  dependents: 2,
};

describe('reducer', () => {
  it('cadastra, edita e remove sem mutar o estado anterior', () => {
    const original = Object.freeze([employee]);
    const edited = employeeReducer(original, {
      type: 'save',
      employee: { ...employee, name: 'Editado' },
    });
    expect(edited[0]?.name).toBe('Editado');
    expect(original[0]?.name).toBe('Exemplo');
    expect(employeeReducer(edited, { type: 'remove', id: '1' })).toEqual([]);
  });
  it('importa de forma idempotente e rejeita duplicatas ou dados inválidos', () => {
    const action = {
      type: 'import',
      employees: [employee, { ...employee, id: '2' }, { ...employee, id: '3', name: '' }],
    } as const;
    expect(employeeReducer([], action)).toEqual([employee]);
    expect(employeeReducer([employee], action)).toEqual([employee]);
  });
});
