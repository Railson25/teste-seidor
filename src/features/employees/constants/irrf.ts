import type { TaxBracket } from '../types/irrf';

export const DEPENDENT_DEDUCTION_CENTS = 18_959;
export const BASIS_POINTS_DIVISOR = 10_000;
export const TAX_BRACKETS = [
  { ceilingCents: 225_920, rateBasisPoints: 0, deductionCents: 0 },
  { ceilingCents: 282_665, rateBasisPoints: 750, deductionCents: 16_944 },
  { ceilingCents: 375_105, rateBasisPoints: 1500, deductionCents: 38_144 },
  { ceilingCents: 466_468, rateBasisPoints: 2250, deductionCents: 66_277 },
  { ceilingCents: Infinity, rateBasisPoints: 2750, deductionCents: 89_600 },
] as const satisfies readonly TaxBracket[];
