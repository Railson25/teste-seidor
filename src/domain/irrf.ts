import type { EmployeeInput } from './employee';
import { validateEmployee } from './employee';

export const DEPENDENT_DEDUCTION_CENTS = 18_959;
export const TAX_BRACKETS = [
  { ceilingCents: 225_920, rateBasisPoints: 0, deductionCents: 0 },
  { ceilingCents: 282_665, rateBasisPoints: 750, deductionCents: 16_944 },
  { ceilingCents: 375_105, rateBasisPoints: 1500, deductionCents: 38_144 },
  { ceilingCents: 466_468, rateBasisPoints: 2250, deductionCents: 66_277 },
  { ceilingCents: Infinity, rateBasisPoints: 2750, deductionCents: 89_600 },
] as const;

export function calculateIrrf(input: EmployeeInput) {
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
    Math.floor((baseCents * bracket.rateBasisPoints + 5000) / 10000) - bracket.deductionCents,
  );
  return { baseCents, taxCents, dependentDeductionCents, ...bracket };
}
