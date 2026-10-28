import { useState } from 'react';
import { EmployeeForm } from './components/EmployeeForm';
import { Dialog } from './components/Dialog';
import type { Employee, EmployeeInput } from './domain/employee';
import { EmployeesProvider, useEmployeeActions, useEmployees } from './state/EmployeesProvider';

function Workspace() {
  const employees = useEmployees();
  const { commit, warning, resetStorage } = useEmployeeActions();
  const [form, setForm] = useState<{ employee?: Employee } | null>(null);
  const [message, setMessage] = useState('');

  function save(input: EmployeeInput) {
    commit({ type: 'save', employee: { ...input, id: form?.employee?.id ?? crypto.randomUUID() } });
    setMessage(form?.employee ? 'Funcionário atualizado.' : 'Funcionário cadastrado.');
    setForm(null);
  }

  return <main>
    <h1>Funcionários</h1><button onClick={() => setForm({})}>Novo funcionário</button>
    <p role="status">{message}</p>
    {warning && <aside aria-label="Aviso de armazenamento"><p>{warning}</p><button onClick={resetStorage}>Redefinir armazenamento com os dados desta sessão</button></aside>}
    <ul>{employees.map(employee => <li key={employee.id}>{employee.name} <button onClick={() => setForm({ employee })}>Editar {employee.name}</button></li>)}</ul>
    {form && <Dialog title={form.employee ? 'Editar funcionário' : 'Novo funcionário'} onClose={() => setForm(null)}><EmployeeForm employee={form.employee} employees={employees} onSave={save} onCancel={() => setForm(null)} /></Dialog>}
  </main>;
}

export function App() { return <EmployeesProvider><Workspace /></EmployeesProvider>; }
