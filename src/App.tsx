import { useMemo, useState } from 'react';
import { EmployeeForm } from './components/EmployeeForm';
import { Dialog } from './components/Dialog';
import { EmployeeTable } from './components/EmployeeTable';
import { TaxDetails } from './components/TaxDetails';
import { DEMO_EMPLOYEES } from './data/demo';
import { calculateIrrf } from './domain/irrf';
import { formatMoney } from './domain/format';
import styles from './App.module.css';
import type { Employee, EmployeeInput } from './domain/employee';
import { EmployeesProvider, useEmployeeActions, useEmployees } from './state/EmployeesProvider';

function Workspace() {
  const employees = useEmployees();
  const { commit, warning, resetStorage } = useEmployeeActions();
  const [form, setForm] = useState<{ employee?: Employee } | null>(null);
  const [message, setMessage] = useState('');
  const [removing, setRemoving] = useState<Employee | null>(null);
  const [inspecting, setInspecting] = useState<Employee | null>(null);
  const totals = useMemo(
    () =>
      employees.reduce(
        (sum, employee) => ({
          gross: sum.gross + employee.grossSalaryCents,
          tax: sum.tax + calculateIrrf(employee).taxCents,
        }),
        { gross: 0, tax: 0 },
      ),
    [employees],
  );

  function save(input: EmployeeInput) {
    commit({ type: 'save', employee: { ...input, id: form?.employee?.id ?? crypto.randomUUID() } });
    setMessage(form?.employee ? 'Funcionário atualizado.' : 'Funcionário cadastrado.');
    setForm(null);
  }

  return (
    <>
      <a className="skipLink" href="#main">
        Pular para o conteúdo
      </a>
      <header className={styles.topbar}>
        <div className={styles.nav}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              ▦
            </span>
            quadro<span className={styles.navLabel}>GESTÃO DE PESSOAS</span>
          </div>
          <span className={styles.localBadge}>Armazenamento local</span>
        </div>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
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
            <button
              className="secondary"
              onClick={() => {
                commit({ type: 'import', employees: DEMO_EMPLOYEES });
                setMessage(
                  'Exemplos fictícios carregados. Cadastros existentes foram preservados.',
                );
              }}
            >
              Carregar exemplos
            </button>
            <button id="new-employee" onClick={() => setForm({})}>
              <span aria-hidden="true">＋ </span>Novo funcionário
            </button>
          </div>
        </div>
        <dl className={styles.stats} aria-label="Resumo de todos os funcionários">
          <div className={styles.stat}>
            <dt>
              Funcionários cadastrados<span aria-hidden="true">♙</span>
            </dt>
            <dd>
              {employees.length.toLocaleString('pt-BR')}
              <p>Total de pessoas na sua equipe</p>
            </dd>
          </div>
          <div className={styles.stat}>
            <dt>
              Salários brutos<span aria-hidden="true">＄</span>
            </dt>
            <dd>
              {formatMoney(totals.gross)}
              <p>Soma mensal dos salários cadastrados</p>
            </dd>
          </div>
          <div className={styles.stat}>
            <dt>
              IRRF total<span aria-hidden="true">％</span>
            </dt>
            <dd>
              {formatMoney(totals.tax)}
              <p>Imposto mensal calculado para a equipe</p>
            </dd>
          </div>
        </dl>
        <div className={styles.notice}>
          <strong>Tabela do desafio</strong>
          <span>
            Cálculo automático com dedução de R$ 189,59 por dependente. Consulte a memória de
            cálculo de cada funcionário.
          </span>
        </div>
        <p role="status" className={message ? styles.success : 'srOnly'}>
          {message}
        </p>
        {warning && (
          <aside className={styles.warning} aria-label="Aviso de armazenamento" role="alert">
            <p>{warning}</p>
            <button className="secondary" onClick={resetStorage}>
              Redefinir armazenamento com os dados desta sessão
            </button>
          </aside>
        )}
        <EmployeeTable
          employees={employees}
          onEdit={(employee) => setForm({ employee })}
          onRemove={setRemoving}
          onInspect={setInspecting}
        />
        {inspecting && (
          <Dialog title="Memória de cálculo" onClose={() => setInspecting(null)}>
            <TaxDetails employee={inspecting} />
          </Dialog>
        )}
        {removing && (
          <Dialog title="Excluir funcionário?" onClose={() => setRemoving(null)}>
            <p>
              O cadastro de <strong>{removing.name}</strong> será excluído. Esta ação não pode ser
              desfeita.
            </p>
            <div className="dialogActions">
              <button className="secondary" onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                className="danger"
                onClick={() => {
                  commit({ type: 'remove', id: removing.id });
                  setMessage('Funcionário excluído.');
                  setRemoving(null);
                }}
              >
                Confirmar exclusão
              </button>
            </div>
          </Dialog>
        )}
        {form && (
          <Dialog
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
              Cadastre os dados mensais. A base e o imposto são atualizados automaticamente ao
              salvar.
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
      </main>
      <footer className={styles.footer}>
        <span>quadro · Funcionários e IRRF</span>
        <span>Dados neste navegador. Use exemplos fictícios para avaliar a aplicação.</span>
      </footer>
    </>
  );
}

export function App() {
  return (
    <EmployeesProvider>
      <Workspace />
    </EmployeesProvider>
  );
}
