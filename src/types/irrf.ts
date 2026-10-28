export interface TaxBracket {
  readonly ceilingCents: number;
  readonly rateBasisPoints: number;
  readonly deductionCents: number;
}

export interface TaxCalculation extends TaxBracket {
  baseCents: number;
  taxCents: number;
  dependentDeductionCents: number;
}
