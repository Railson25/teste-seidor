import type { EmployeeInput } from '../types/employee';
import type { TaxCalculation } from '../types/irrf';
import { BASIS_POINTS_DIVISOR, DEPENDENT_DEDUCTION_CENTS, TAX_BRACKETS } from '../constants/irrf';
import { validateEmployee } from './employee';

export function calculateIrrf(input: EmployeeInput): TaxCalculation {
  if (Object.keys(validateEmployee(input)).length)
    throw new Error('Dados inválidos para o cálculo.');
  const dependentDeductionCents = input.dependents * DEPENDENT_DEDUCTION_CENTS;
  const baseCents = Math.max(
    0,
    input.grossSalaryCents - input.socialSecurityCents - dependentDeductionCents,
  );
  const bracket = TAX_BRACKETS.find((item) => baseCents <= item.ceilingCents)!;
  const taxCents = Math.max(
    0,
    Math.floor(
      (baseCents * bracket.rateBasisPoints + BASIS_POINTS_DIVISOR / 2) / BASIS_POINTS_DIVISOR,
    ) - bracket.deductionCents,
  );
  return { baseCents, taxCents, dependentDeductionCents, ...bracket };
}
