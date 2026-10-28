import type { Employee, EmployeeInput } from '../types/employee';
import { EMPLOYEE_FORM_FIELDS } from '../constants/employeeForm';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { Button } from '../../../shared/ui/Button/Button';
import { TextField } from '../../../shared/ui/TextField/TextField';
import { FeedbackMessage } from '../../../shared/ui/FeedbackMessage/FeedbackMessage';
import styles from './EmployeeForm.module.css';

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
      <p className={styles.intro}>
        Todos os campos são obrigatórios. O IRRF será calculado ao salvar.
      </p>
      {Object.keys(errors).length > 0 && (
        <FeedbackMessage variant="error">Confira os campos indicados abaixo.</FeedbackMessage>
      )}
      <div className={styles.grid}>
        {EMPLOYEE_FORM_FIELDS.map(({ key, label, hint, maxLength }) => (
          <TextField
            key={key}
            containerClassName={key === 'name' ? styles.wide : undefined}
            id={prefix + '-' + key}
            name={key}
            label={label}
            hint={hint}
            error={errors[key]}
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
            onChange={(event) => updateField(key, event.target.value)}
          />
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{employee ? 'Salvar alterações' : 'Cadastrar funcionário'}</Button>
      </div>
    </form>
  );
}
