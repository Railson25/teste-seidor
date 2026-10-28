import type { EmployeeSummary as Summary } from '../types/employee';
import { formatMoney } from '../utils/format';
import styles from './EmployeeSummary.module.css';

interface Props {
  count: number;
  summary: Summary;
}

export function EmployeeSummary({ count, summary }: Props) {
  return (
    <dl className={styles.stats} aria-label="Resumo de todos os funcionários">
      <div className={styles.stat}>
        <dt>
          Funcionários cadastrados<span aria-hidden="true">♙</span>
        </dt>
        <dd>
          {count.toLocaleString('pt-BR')}
          <p>Total de pessoas na sua equipe</p>
        </dd>
      </div>
      <div className={styles.stat}>
        <dt>
          Salários brutos<span aria-hidden="true">＄</span>
        </dt>
        <dd>
          {formatMoney(summary.grossCents)}
          <p>Soma mensal dos salários cadastrados</p>
        </dd>
      </div>
      <div className={styles.stat}>
        <dt>
          IRRF total<span aria-hidden="true">％</span>
        </dt>
        <dd>
          {formatMoney(summary.taxCents)}
          <p>Imposto mensal calculado para a equipe</p>
        </dd>
      </div>
    </dl>
  );
}
