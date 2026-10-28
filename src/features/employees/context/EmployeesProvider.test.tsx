import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';
import type { Employee, EmployeeAction } from '../types/employee';
import { EmployeesProvider } from './EmployeesProvider';
import { useEmployeeActions, useEmployees } from '../hooks/useEmployees';
import { STORAGE_KEY, STORAGE_VERSION } from '../constants/storage';

const first: Employee = {
  id: 'first',
  name: 'Primeiro exemplo',
  cpf: '52998224725',
  grossSalaryCents: 500000,
  socialSecurityCents: 50000,
  dependents: 2,
};
const second: Employee = { ...first, id: 'second', name: 'Segundo exemplo', cpf: '11144477735' };

function wrapper({ children }: PropsWithChildren) {
  return (
    <StrictMode>
      <EmployeesProvider>{children}</EmployeesProvider>
    </StrictMode>
  );
}

function useEmployeeSession() {
  return { employees: useEmployees(), ...useEmployeeActions() };
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('consistência entre a sessão e o armazenamento', () => {
  it.each<{
    scenario: string;
    initial: Employee[];
    actions: EmployeeAction[];
    expected: Employee[];
  }>([
    {
      scenario: 'duas inclusões',
      initial: [],
      actions: [
        { type: 'save', employee: first },
        { type: 'save', employee: second },
      ],
      expected: [first, second],
    },
    {
      scenario: 'inclusão seguida de exclusão',
      initial: [],
      actions: [
        { type: 'save', employee: first },
        { type: 'remove', id: first.id },
      ],
      expected: [],
    },
    {
      scenario: 'edição seguida de inclusão',
      initial: [first],
      actions: [
        { type: 'save', employee: { ...first, grossSalaryCents: 600000 } },
        { type: 'save', employee: second },
      ],
      expected: [{ ...first, grossSalaryCents: 600000 }, second],
    },
  ])(
    'persiste $scenario no mesmo evento e recupera após remontar',
    ({ initial, actions, expected }) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, employees: initial }),
      );
      const session = renderHook(useEmployeeSession, { wrapper });
      act(() => {
        for (const action of actions) session.result.current.commit(action);
      });
      expect(session.result.current.employees).toEqual(expected);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
        version: STORAGE_VERSION,
        employees: expected,
      });
      session.unmount();
      const restored = renderHook(useEmployeeSession, { wrapper });
      expect(restored.result.current.employees).toEqual(expected);
    },
  );

  it('mantém conteúdo corrompido até redefinir e salva ações seguintes do mesmo evento', () => {
    localStorage.setItem(STORAGE_KEY, '{corrompido');
    const { result } = renderHook(useEmployeeSession, { wrapper });
    act(() => {
      result.current.commit({ type: 'save', employee: first });
    });
    expect(result.current.employees).toEqual([first]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{corrompido');
    expect(result.current.warning).toContain('sessão');
    act(() => {
      result.current.resetStorage();
      result.current.commit({ type: 'save', employee: second });
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).employees).toEqual([first, second]);
    expect(result.current.warning).toBe('');
  });

  it('mantém ações sucessivas em memória e recupera a gravação após falha de quota', () => {
    const { result } = renderHook(useEmployeeSession, { wrapper });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError');
    });
    act(() => {
      result.current.commit({ type: 'save', employee: first });
      result.current.commit({ type: 'save', employee: second });
    });
    expect(result.current.employees).toEqual([first, second]);
    expect(result.current.warning).toContain('sessão');
    write.mockRestore();
    act(() => {
      result.current.resetStorage();
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).employees).toEqual([first, second]);
    expect(result.current.warning).toBe('');
  });
});
