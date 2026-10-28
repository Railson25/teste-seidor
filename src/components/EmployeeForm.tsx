import { useId, useState } from 'react';
import type { SubmitEvent } from 'react';
import { normalizeCpf, validateEmployee } from '../domain/employee';
import type { Employee, EmployeeErrors, EmployeeInput } from '../domain/employee';
import { moneyToInput, parseMoney } from '../domain/format';

interface Props {
  employee: Employee | undefined;
  employees: readonly Employee[];
  onSave: (input: EmployeeInput) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, employees, onSave, onCancel }: Props) {
  const prefix = useId();
  const [values, setValues] = useState({
    name: employee?.name ?? '', cpf: employee?.cpf ?? '',
    grossSalaryCents: employee ? moneyToInput(employee.grossSalaryCents) : '',
    socialSecurityCents: employee ? moneyToInput(employee.socialSecurityCents) : '0,00',
    dependents: String(employee?.dependents ?? 0),
  });
  const [errors, setErrors] = useState<EmployeeErrors>({});

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: EmployeeInput = {
      name: values.name.trim(), cpf: normalizeCpf(values.cpf),
      grossSalaryCents: parseMoney(values.grossSalaryCents),
      socialSecurityCents: parseMoney(values.socialSecurityCents),
      dependents: /^\d+$/.test(values.dependents) ? Number(values.dependents) : NaN,
    };
    const nextErrors = validateEmployee(input, employees, employee?.id);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) document.getElementById(`${prefix}-${first}`)?.focus();
    else onSave(input);
  }

  const fields = [
    { key: 'name', label: 'Nome', hint: 'Como a pessoa deve aparecer na lista.', maxLength: 120 },
    { key: 'cpf', label: 'CPF', hint: '11 dígitos, com ou sem pontuação.', maxLength: 14 },
    { key: 'grossSalaryCents', label: 'Salário bruto (R$)', hint: 'Ex.: 5000,00, sem separador de milhar.', maxLength: 12 },
    { key: 'socialSecurityCents', label: 'Desconto da previdência (R$)', hint: 'Valor mensal informado manualmente.', maxLength: 12 },
    { key: 'dependents', label: 'Número de dependentes', hint: 'Dedução de R$ 189,59 por dependente.', maxLength: 11 },
  ] as const;

  return <form onSubmit={submit} noValidate>
    <p className="formIntro">Todos os campos são obrigatórios. O IRRF será calculado ao salvar.</p>
    {Object.keys(errors).length > 0 && <p role="alert" className="errorSummary">Confira os campos indicados abaixo.</p>}
    <div className="formGrid">{fields.map(({ key, label, hint, maxLength }) => <div key={key} className={key === 'name' ? 'wide' : ''}>
      <label htmlFor={`${prefix}-${key}`}>{label}</label>
      <input id={`${prefix}-${key}`} name={key} value={values[key]} required maxLength={maxLength}
        autoComplete={key === 'name' ? 'name' : 'off'}
        inputMode={key === 'cpf' || key === 'dependents' ? 'numeric' : key === 'name' ? 'text' : 'decimal'}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={`${prefix}-${key}-hint${errors[key] ? ` ${prefix}-${key}-error` : ''}`}
        onChange={event => setValues({ ...values, [key]: event.target.value })} />
      <small id={`${prefix}-${key}-hint`}>{hint}</small>
      {errors[key] && <p id={`${prefix}-${key}-error`} className="fieldError">{errors[key]}</p>}
    </div>)}</div>
    <div className="dialogActions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button type="submit">{employee ? 'Salvar alterações' : 'Cadastrar funcionário'}</button></div>
  </form>;
}
