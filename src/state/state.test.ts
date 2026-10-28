import { beforeEach, describe, expect, it, vi } from 'vitest';
import { employeeReducer } from './reducer';
import { readEmployees, STORAGE_KEY, writeEmployees } from './storage';
import type { Employee } from '../domain/employee';

const employee: Employee = {
  id: '1',
  name: 'Exemplo',
  cpf: '52998224725',
  grossSalaryCents: 500000,
  socialSecurityCents: 50000,
  dependents: 2,
};
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

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

describe('persistência versionada', () => {
  it('inicia vazia e recupera registros válidos', () => {
    expect(readEmployees().employees).toEqual([]);
    expect(writeEmployees([employee])).toBe('');
    expect(readEmployees()).toEqual({ employees: [employee], warning: '', blocked: false });
  });
  it.each(['{', '{"version":2,"employees":[]}', '{"version":1,"employees":[{}]}'])(
    'preserva armazenamento inválido: %s',
    (raw) => {
      localStorage.setItem(STORAGE_KEY, raw);
      expect(readEmployees().blocked).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
    },
  );
  it('rejeita CPFs e identificadores duplicados', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, employees: [employee, employee] }),
    );
    expect(readEmployees().blocked).toBe(true);
  });
  it('informa falhas de leitura e escrita sem derrubar a aplicação', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error();
    });
    expect(readEmployees().warning).toContain('sessão');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error();
    });
    expect(writeEmployees([employee])).toContain('sessão');
  });
});
