import type { Employee } from '../domain/employee';

// Synthetic identities for exercising the challenge; not a real employee dataset.
export const DEMO_EMPLOYEES: readonly Employee[] = [
  { id: 'demo-1', name: 'Ana · Exemplo fictício', cpf: '52998224725', grossSalaryCents: 500000, socialSecurityCents: 50000, dependents: 2 },
  { id: 'demo-2', name: 'Bruno · Exemplo fictício', cpf: '11144477735', grossSalaryCents: 225920, socialSecurityCents: 18000, dependents: 0 },
  { id: 'demo-3', name: 'Carla · Exemplo fictício', cpf: '12345678909', grossSalaryCents: 800000, socialSecurityCents: 85000, dependents: 1 },
];
