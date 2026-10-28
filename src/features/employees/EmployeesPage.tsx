import { ConfirmDialog } from '../../shared/ui/ConfirmDialog/ConfirmDialog';
import { FeedbackMessage } from '../../shared/ui/FeedbackMessage/FeedbackMessage';
import { Button } from '../../shared/ui/Button/Button';
import { useMemo, useRef, useState } from 'react';
import { EmployeeForm } from './components/EmployeeForm';
import { Dialog } from '../../shared/ui/Dialog/Dialog';
import { EmployeeTable } from './components/EmployeeTable';
import { TaxDetails } from './components/TaxDetails';
import { DEMO_EMPLOYEES } from './data/demo';
import { summarizeEmployees } from './helpers/employees';
import { DEPENDENT_DEDUCTION_CENTS } from './constants/irrf';
import { EmployeeSummary } from './components/EmployeeSummary';
import { formatMoney } from '../../shared/utils/currency';
import styles from './EmployeesPage.module.css';
import type { Employee, EmployeeInput } from './types/employee';
import { EmployeesProvider } from './context/EmployeesProvider';
import { useEmployeeActions, useEmployees } from './hooks/useEmployees';

function Workspace() {
  const employees = useEmployees();
  const { commit, warning, resetStorage } = useEmployeeActions();
  const [form, setForm] = useState<{ employee?: Employee } | null>(null);
  const [message, setMessage] = useState('');
  const [removing, setRemoving] = useState<Employee | null>(null);
  const [inspecting, setInspecting] = useState<Employee | null>(null);
  const totals = useMemo(() => summarizeEmployees(employees), [employees]);
  const newEmployeeButtonRef = useRef<HTMLButtonElement>(null);

  function save(input: EmployeeInput) {
    commit({ type: 'save', employee: { ...input, id: form?.employee?.id ?? crypto.randomUUID() } });
    setMessage(form?.employee ? 'Funcionário atualizado.' : 'Funcionário cadastrado.');
    setForm(null);
  }

  return (
    <>
      <p className={styles.breadcrumb}>
        Gestão de pessoas <span>/ Funcionários</span>
      </p>
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Pessoas, números e clareza</p>
          <h1>Funcionários</h1>
          <p>Sua equipe organizada. O cálculo do IRRF, sem complicação.</p>
        </div>
        <div className={styles.heroActions}>
          <Button
            variant="secondary"
            onClick={() => {
              commit({ type: 'import', employees: DEMO_EMPLOYEES });
              setMessage('Exemplos fictícios carregados. Cadastros existentes foram preservados.');
            }}
          >
            Carregar exemplos
          </Button>
          <Button id="new-employee" ref={newEmployeeButtonRef} onClick={() => setForm({})}>
            <span aria-hidden="true">＋ </span>Novo funcionário
          </Button>
        </div>
      </div>
      <EmployeeSummary count={employees.length} summary={totals} />
      <div className={styles.notice}>
        <strong>Tabela do desafio</strong>
        <span>
          Cálculo automático com dedução de {formatMoney(DEPENDENT_DEDUCTION_CENTS)} por dependente.
          Consulte a memória de cálculo de cada funcionário.
        </span>
      </div>
      <FeedbackMessage variant="success">{message}</FeedbackMessage>
      {warning && (
        <FeedbackMessage variant="warning" aria-label="Aviso de armazenamento">
          <p>{warning}</p>
          <Button variant="secondary" onClick={resetStorage}>
            Redefinir armazenamento com os dados desta sessão
          </Button>
        </FeedbackMessage>
      )}
      <EmployeeTable
        employees={employees}
        onEdit={(employee) => setForm({ employee })}
        onRemove={setRemoving}
        onInspect={setInspecting}
      />
      {inspecting && (
        <Dialog
          fallbackFocusRef={newEmployeeButtonRef}
          title="Memória de cálculo"
          onClose={() => setInspecting(null)}
        >
          <TaxDetails employee={inspecting} />
        </Dialog>
      )}
      {removing && (
        <ConfirmDialog
          fallbackFocusRef={newEmployeeButtonRef}
          title="Excluir funcionário?"
          confirmLabel="Confirmar exclusão"
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            commit({ type: 'remove', id: removing.id });
            setMessage('Funcionário excluído.');
            setRemoving(null);
          }}
        >
          <p>
            O cadastro de <strong>{removing.name}</strong> será excluído. Esta ação não pode ser
            desfeita.
          </p>
        </ConfirmDialog>
      )}
      {form && (
        <Dialog
          fallbackFocusRef={newEmployeeButtonRef}
          title={form.employee ? 'Editar funcionário' : 'Novo funcionário'}
          onClose={() => setForm(null)}
        >
          <EmployeeForm
            employee={form.employee}
            employees={employees}
            onSave={save}
            onCancel={() => setForm(null)}
          />
        </Dialog>
      )}
      <section className={styles.guide} aria-labelledby="guide-title">
        <div>
          <h2 id="guide-title">Transparência em cada cálculo</h2>
          <p>
            Cadastre os dados mensais. A base e o imposto são atualizados automaticamente ao salvar.
          </p>
        </div>
        <div className={styles.formula}>
          <p>
            <strong>Base de IR</strong> = salário bruto − previdência − dedução dos dependentes
          </p>
          <p>
            <strong>IRRF</strong> = base de IR × alíquota − parcela a deduzir
          </p>
        </div>
      </section>
    </>
  );
}

export function EmployeesPage() {
  return (
    <EmployeesProvider>
      <Workspace />
    </EmployeesProvider>
  );
}
