import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { FeedbackMessage } from './FeedbackMessage';
import { Button } from '../Button/Button';

it('mantém a região de sucesso e permite atualizar seu conteúdo', () => {
  const { rerender } = render(<FeedbackMessage variant="success">{''}</FeedbackMessage>);
  const status = screen.getByRole('status');
  expect(status).toBeEmptyDOMElement();
  rerender(<FeedbackMessage variant="success">Cadastro concluído.</FeedbackMessage>);
  expect(screen.getByRole('status')).toBe(status);
  expect(status).toHaveTextContent('Cadastro concluído.');
  rerender(<FeedbackMessage variant="success">{0}</FeedbackMessage>);
  expect(status).toHaveTextContent('0');
});

it('anuncia avisos como alerta e aceita ações por composição', async () => {
  const action = vi.fn();
  render(
    <FeedbackMessage variant="warning" aria-label="Aviso">
      <p>Gravação indisponível.</p>
      <Button onClick={action}>Tentar novamente</Button>
    </FeedbackMessage>,
  );
  expect(screen.getByRole('alert', { name: 'Aviso' })).toHaveTextContent('Gravação indisponível.');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(action).toHaveBeenCalledOnce();
});
