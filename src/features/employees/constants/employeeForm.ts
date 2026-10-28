import { DEPENDENT_DEDUCTION_CENTS } from './irrf';
import { MAX_NAME_LENGTH } from './employee';

export const EMPLOYEE_FORM_FIELDS = [
  {
    key: 'name',
    label: 'Nome',
    hint: 'Como a pessoa deve aparecer na lista.',
    maxLength: MAX_NAME_LENGTH,
  },
  { key: 'cpf', label: 'CPF', hint: '11 dígitos, com ou sem pontuação.', maxLength: 14 },
  {
    key: 'grossSalaryCents',
    label: 'Salário bruto (R$)',
    hint: 'Ex.: 5000,00, sem separador de milhar.',
    maxLength: 12,
  },
  {
    key: 'socialSecurityCents',
    label: 'Desconto da previdência (R$)',
    hint: 'Valor mensal informado manualmente.',
    maxLength: 12,
  },
  {
    key: 'dependents',
    label: 'Número de dependentes',
    hint: `Dedução de R$ ${(DEPENDENT_DEDUCTION_CENTS / 100).toFixed(2).replace('.', ',')} por dependente.`,
    maxLength: 11,
  },
] as const;
