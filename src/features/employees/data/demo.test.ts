import { expect, it } from 'vitest';
import { DEMO_EMPLOYEES } from './demo';
import { validateEmployee } from '../helpers/employeeValidation';
import { calculateIrrf } from '../helpers/irrf';
import { employeeReducer } from '../context/employeesReducer';

it('fornece exemplos válidos, idempotentes e em faixas diferentes', () => {
  for (const employee of DEMO_EMPLOYEES) expect(validateEmployee(employee)).toEqual({});
  expect(
    new Set(DEMO_EMPLOYEES.map((employee) => calculateIrrf(employee).rateBasisPoints)).size,
  ).toBe(3);
  expect(employeeReducer(DEMO_EMPLOYEES, { type: 'import', employees: DEMO_EMPLOYEES })).toEqual(
    DEMO_EMPLOYEES,
  );
});
