import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readEmployees, writeEmployees } from './employeeStorage';
import { STORAGE_KEY } from '../constants/storage';
import type { Employee } from '../types/employee';

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
