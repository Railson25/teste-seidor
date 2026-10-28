import type { Employee } from './employee';

export interface StorageSnapshot {
  employees: Employee[];
  warning: string;
  blocked: boolean;
}
