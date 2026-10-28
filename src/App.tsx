import { useState } from 'react';
import { EmployeeForm } from './components/EmployeeForm';
import { Dialog } from './components/Dialog';
import { EmployeeTable } from './components/EmployeeTable';
import type { Employee, EmployeeInput } from './domain/employee';
import { EmployeesProvider, useEmployeeActions, useEmployees } from './state/EmployeesProvider';

function Workspace() {
  const employees = useEmployees();
  const { commit, warning, resetStorage } = useEmployeeActions();
  const [form, setForm] = useState<{ employee?: Employee } | null>(null);
  const [message, setMessage] = useState('');
  const [removing, setRemoving] = useState<Employee | null>(null);

  function save(input: EmployeeInput) {
    commit({ type: 'save', employee: { ...input, id: form?.employee?.id ?? crypto.randomUUID() } });
    setMessage(form?.employee ? 'Funcionário atualizado.' : 'Funcionário cadastrado.');
    setForm(null);
  }

  return <main>
    <h1>Funcionários</h1><button onClick={() => setForm({})}>Novo funcionário</button>
    <p role="status">{message}</p>
    {warning && <aside aria-label="Aviso de armazenamento"><p>{warning}</p><button onClick={resetStorage}>Redefinir armazenamento com os dados desta sessão</button></aside>}
    <EmployeeTable employees={employees} onEdit={employee => setForm({ employee })} onRemove={setRemoving} />
    {removing && <Dialog title="Excluir funcionário?" onClose={() => setRemoving(null)}><p>O cadastro de <strong>{removing.name}</strong> será excluído. Esta ação não pode ser desfeita.</p><div className="dialogActions"><button className="secondary" onClick={() => setRemoving(null)}>Cancelar</button><button className="danger" onClick={() => { commit({ type: 'remove', id: removing.id }); setMessage('Funcionário excluído.'); setRemoving(null); document.getElementById('new-employee')?.focus(); }}>Confirmar exclusão</button></div></Dialog>}
    {form && <Dialog title={form.employee ? 'Editar funcionário' : 'Novo funcionário'} onClose={() => setForm(null)}><EmployeeForm employee={form.employee} employees={employees} onSave={save} onCancel={() => setForm(null)} /></Dialog>}
  </main>;
}

export function App() { return <EmployeesProvider><Workspace /></EmployeesProvider>; }

