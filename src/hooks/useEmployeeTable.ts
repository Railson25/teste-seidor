import { useMemo, useState } from 'react';
import type { Employee } from '../types/employee';
import { filterEmployees } from '../helpers/employees';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';

export function useEmployeeTable(employees: readonly Employee[]) {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const filtered = useMemo(() => filterEmployees(employees, name, cpf), [employees, name, cpf]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function updateName(value: string) {
    setName(value);
    setPage(1);
  }
  function updateCpf(value: string) {
    setCpf(value.replace(/[^\d.-]/g, ''));
    setPage(1);
  }
  function updatePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }
  function clearFilters() {
    setName('');
    setCpf('');
    setPage(1);
  }

  return {
    name,
    cpf,
    pageSize,
    filtered,
    pages,
    currentPage,
    start,
    visible,
    updateName,
    updateCpf,
    updatePageSize,
    clearFilters,
    setPage,
  };
}
