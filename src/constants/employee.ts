import { DEPENDENT_DEDUCTION_CENTS } from './irrf';

export const MAX_NAME_LENGTH = 120;
// Keeps all intermediate tax multiplications safely within Number.MAX_SAFE_INTEGER.
export const MAX_MONEY_CENTS = 99_999_999_999;
export const MAX_DEPENDENTS = Math.floor(Number.MAX_SAFE_INTEGER / DEPENDENT_DEDUCTION_CENTS);
