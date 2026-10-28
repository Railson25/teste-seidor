import type { Employee, EmployeeInput } from '../types/employee';
import { EMPLOYEE_FORM_FIELDS } from '../constants/employeeForm';
import { useEmployeeForm } from '../hooks/useEmployeeForm';

interface Props {
  employee: Employee | undefined;
  employees: readonly Employee[];
  onSave: (input: EmployeeInput) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, employees, onSave, onCancel }: Props) {
  const { prefix, values, errors, updateField, submit } = useEmployeeForm(
    employee,
    employees,
    onSave,
  );

  return (
    <form onSubmit={submit} noValidate>
      <p className="formIntro">
        Todos os campos são obrigatórios. O IRRF será calculado ao salvar.
      </p>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="errorSummary">
          Confira os campos indicados abaixo.
        </p>
      )}
      <div className="formGrid">
        {EMPLOYEE_FORM_FIELDS.map(({ key, label, hint, maxLength }) => (
          <div key={key} className={key === 'name' ? 'wide' : ''}>
            <label htmlFor={`${prefix}-${key}`}>{label}</label>
            <input
              id={`${prefix}-${key}`}
              name={key}
              value={values[key]}
              required
              maxLength={maxLength}
              autoComplete={key === 'name' ? 'name' : 'off'}
              inputMode={
                key === 'cpf' || key === 'dependents'
                  ? 'numeric'
                  : key === 'name'
                    ? 'text'
                    : 'decimal'
              }
              aria-invalid={Boolean(errors[key])}
              aria-describedby={`${prefix}-${key}-hint${errors[key] ? ` ${prefix}-${key}-error` : ''}`}
              onChange={(event) => updateField(key, event.target.value)}
            />
            <small id={`${prefix}-${key}-hint`}>{hint}</small>
            {errors[key] && (
              <p id={`${prefix}-${key}-error`} className="fieldError">
                {errors[key]}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="dialogActions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit">{employee ? 'Salvar alterações' : 'Cadastrar funcionário'}</button>
      </div>
    </form>
  );
}
