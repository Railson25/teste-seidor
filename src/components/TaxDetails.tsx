import type { Employee } from '../types/employee';
import { formatMoney } from '../utils/format';
import { calculateIrrf } from '../domain/irrf';
import { DEPENDENT_DEDUCTION_CENTS } from '../constants/irrf';

export function TaxDetails({ employee }: { employee: Employee }) {
  const tax = calculateIrrf(employee);
  return (
    <>
      <p className="formIntro">{employee.name}</p>
      <dl className="calculation">
        <div>
          <dt>Salário bruto</dt>
          <dd>{formatMoney(employee.grossSalaryCents)}</dd>
        </div>
        <div>
          <dt>Desconto da previdência</dt>
          <dd>− {formatMoney(employee.socialSecurityCents)}</dd>
        </div>
        <div>
          <dt>
            {employee.dependents} dependente(s) × {formatMoney(DEPENDENT_DEDUCTION_CENTS)}
          </dt>
          <dd>− {formatMoney(tax.dependentDeductionCents)}</dd>
        </div>
        <div className="calculationTotal">
          <dt>Base de cálculo</dt>
          <dd>{formatMoney(tax.baseCents)}</dd>
        </div>
        <div>
          <dt>Alíquota da faixa</dt>
          <dd>{tax.rateBasisPoints / 100}%</dd>
        </div>
        <div>
          <dt>Parcela a deduzir</dt>
          <dd>− {formatMoney(tax.deductionCents)}</dd>
        </div>
        <div className="calculationTotal">
          <dt>IRRF mensal</dt>
          <dd>{formatMoney(tax.taxCents)}</dd>
        </div>
      </dl>
      <p className="calculationNote">
        IRRF = base × alíquota − parcela a deduzir. Base e imposto têm mínimo de zero; o imposto é
        arredondado ao centavo.
      </p>
      <p className="calculationNote">
        Tabela fixa do desafio técnico. Este demonstrativo não substitui um sistema de folha de
        pagamento.
      </p>
    </>
  );
}
