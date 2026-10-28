import { useMemo, useState } from 'react';
import type { Employee } from '../domain/employee';
import { normalizeCpf } from '../domain/employee';
import { formatCpf, formatMoney } from '../domain/format';
import { calculateIrrf } from '../domain/irrf';
import styles from './EmployeeTable.module.css';

interface Props {
  employees: readonly Employee[];
  onEdit: (employee: Employee) => void;
  onRemove?: (employee: Employee) => void;
  onInspect?: (employee: Employee) => void;
}

const normalizeName = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function EmployeeTable({ employees, onEdit, onRemove, onInspect }: Props) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filtered = useMemo(() => employees.filter(employee => normalizeName(employee.name).includes(normalizeName(name.trim())) && employee.cpf.includes(normalizeCpf(cpf))), [employees, name, cpf]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return <section className={styles.panel} aria-labelledby="employees-title">
    <div className={styles.heading}><div><h2 id="employees-title">Pessoas da equipe</h2><p>Consulte os dados e o imposto calculado para cada pessoa.</p></div><span className={styles.badge}>{employees.length} {employees.length === 1 ? 'cadastro' : 'cadastros'}</span></div>
    <div className={styles.filters}>
      <div><label htmlFor="filter-name">Buscar por nome</label><input id="filter-name" type="search" placeholder="Nome do funcionário" value={name} onChange={event => { setName(event.target.value); setPage(1); }} /></div>
      <div><label htmlFor="filter-cpf">Filtrar por CPF</label><input id="filter-cpf" type="search" inputMode="numeric" placeholder="CPF completo ou parcial" value={cpf} onChange={event => { setCpf(event.target.value.replace(/[^\d.-]/g, '')); setPage(1); }} /></div>
      {(name || cpf) && <button className="textButton" onClick={() => { setName(''); setCpf(''); setPage(1); }}>Limpar filtros</button>}
    </div>
    {visible.length === 0 ? <div className={styles.empty}><span aria-hidden="true">◇</span><h3>{employees.length ? 'Nenhum resultado encontrado' : 'Sua equipe começa aqui'}</h3><p>{employees.length ? 'Ajuste os filtros para encontrar um funcionário.' : 'Cadastre o primeiro funcionário ou carregue os exemplos fictícios.'}</p></div> : <div className={styles.tableRegion} role="region" aria-label="Tabela de funcionários, role horizontalmente em telas pequenas" tabIndex={0}>
      <table><caption className="srOnly">Funcionários e cálculo mensal de IRRF conforme a tabela do desafio</caption><thead><tr><th scope="col">Funcionário / CPF</th><th scope="col">Salário bruto</th><th scope="col">Previdência</th><th scope="col">Dependentes</th><th scope="col">Base de IR</th><th scope="col">IRRF</th><th scope="col">Ações</th></tr></thead>
        <tbody>{visible.map(employee => {
          const tax = calculateIrrf(employee);
          return <tr key={employee.id}><th scope="row"><span className={styles.name}>{employee.name}</span><span className={styles.cpf}>{formatCpf(employee.cpf)}</span></th><td>{formatMoney(employee.grossSalaryCents)}</td><td>{formatMoney(employee.socialSecurityCents)}</td><td>{employee.dependents}</td><td>{formatMoney(tax.baseCents)}</td><td><span className={tax.taxCents === 0 ? styles.exempt : styles.tax}>{tax.taxCents === 0 ? 'Isento' : formatMoney(tax.taxCents)}</span></td><td><div className={styles.actions}>
            {onInspect && <button className="textButton" aria-label={`Ver cálculo de ${employee.name}`} onClick={() => onInspect(employee)}>Cálculo</button>}
            <button className="textButton" aria-label={`Editar ${employee.name}`} onClick={() => onEdit(employee)}>Editar</button>
            {onRemove && <button className="textButton dangerText" aria-label={`Excluir ${employee.name}`} onClick={() => onRemove(employee)}>Excluir</button>}
          </div></td></tr>;
        })}</tbody></table>
    </div>}
    <div className={styles.pagination}><p role="status">{filtered.length === 0 ? '0 resultados' : `${start + 1}–${Math.min(start + pageSize, filtered.length)} de ${filtered.length} funcionários`}</p><div><label htmlFor="page-size">Por página</label><select id="page-size" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10, 25, 50].map(size => <option key={size}>{size}</option>)}</select><button className="secondary" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>←</button><span>{currentPage} / {pages}</span><button className="secondary" aria-label="Próxima página" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>→</button></div></div>
  </section>;
}
