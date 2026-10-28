import type { PropsWithChildren } from 'react';
import styles from './AppLayout.module.css';

export function AppLayout({ children }: PropsWithChildren) {
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
        {children}
      </main>
      <footer className={styles.footer}>
        <span>quadro · Funcionários e IRRF</span>
        <span>Dados neste navegador. Use exemplos fictícios para avaliar a aplicação.</span>
      </footer>
    </>
  );
}
