import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

async function fillEmployee(page: Page) {
  await page.getByRole('button', { name: 'Novo funcionário' }).click();
  await page.getByLabel('Nome', { exact: true }).fill('Ágata Fictícia');
  await page.getByLabel('CPF', { exact: true }).fill('529.982.247-25');
  await page.getByLabel('Salário bruto (R$)').fill('5000,00');
  await page.getByLabel('Desconto da previdência (R$)').fill('500,00');
  await page.getByLabel('Número de dependentes').fill('2');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('CRUD, cálculo, persistência, filtros e confirmação de exclusão', async ({ page }) => {
  await fillEmployee(page);
  await page.getByRole('button', { name: 'Cadastrar funcionário' }).click();
  let row = page.getByRole('row', { name: /Ágata Fictícia/ });
  await expect(row).toContainText('264,41');
  await page.reload();
  await expect(row).toBeVisible();
  await page.getByRole('button', { name: 'Ver cálculo de Ágata Fictícia' }).click();
  await expect(page.getByRole('dialog')).toContainText('4.120,82');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Editar Ágata Fictícia' }).click();
  await page.getByLabel('Salário bruto (R$)').fill('6000,00');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  row = page.getByRole('row', { name: /Ágata Fictícia/ });
  await expect(row).toContainText('512,23');
  await page.getByLabel('Buscar por nome').fill('AGATA');
  await page.getByLabel('Filtrar por CPF').fill('529.982');
  await expect(row).toBeVisible();
  await page.getByLabel('Filtrar por CPF').fill('000');
  await expect(page.getByText('Nenhum resultado encontrado')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.getByRole('button', { name: 'Excluir Ágata Fictícia' }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(row).toBeVisible();
  await page.getByRole('button', { name: 'Excluir Ágata Fictícia' }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page.getByRole('button', { name: 'Novo funcionário' })).toBeFocused();
  await page.reload();
  await expect(page.getByText('Sua equipe começa aqui')).toBeVisible();
});

test('exemplos são idempotentes e CPF duplicado é bloqueado', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.getByRole('button', { name: 'Carregar exemplos' }).click();
  await page.getByRole('button', { name: 'Carregar exemplos' }).click();
  await expect(page.getByRole('row')).toHaveCount(4);
  await page.screenshot({ path: '.cache/desktop.png', fullPage: true });
  await fillEmployee(page);
  await page.getByRole('button', { name: 'Cadastrar funcionário' }).click();
  await expect(page.getByText('Este CPF já está cadastrado.')).toBeVisible();
  await expect(page.getByLabel('CPF', { exact: true })).toBeFocused();
});

test('dados corrompidos são preservados até a redefinição explícita', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('quadro.employees.v1', '{corrompido'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Não foi possível recuperar');
  await page.getByRole('button', { name: 'Carregar exemplos' }).click();
  expect(await page.evaluate(() => localStorage.getItem('quadro.employees.v1'))).toBe(
    '{corrompido',
  );
  await page
    .getByRole('button', { name: 'Redefinir armazenamento com os dados desta sessão' })
    .click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('row')).toHaveCount(4);
});

test('falha ao gravar mantém o CRUD funcionando nesta sessão', async ({ page }) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: 'Carregar exemplos' }).click();
  await expect(page.getByRole('alert')).toContainText('apenas nesta sessão');
  await expect(page.getByRole('row')).toHaveCount(4);
  await page.getByRole('button', { name: 'Excluir Ana · Exemplo fictício' }).click();
  await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
  await expect(page.getByRole('row')).toHaveCount(3);
});

test('diálogo mantém o foco, aceita Escape e devolve o foco ao acionador', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Novo funcionário' });
  await trigger.click();
  await expect(page.getByRole('button', { name: 'Fechar diálogo' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Cadastrar funcionário' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Fechar diálogo' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('WCAG AA no painel, formulário inválido e memória de cálculo', async ({ page }) => {
  const audit = () =>
    new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect((await audit()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Carregar exemplos' }).click();
  expect((await audit()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Novo funcionário' }).click();
  await page.getByRole('button', { name: 'Cadastrar funcionário' }).click();
  expect((await audit()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Ver cálculo de Ana · Exemplo fictício' }).click();
  expect((await audit()).violations).toEqual([]);
});

test('layout móvel evita transbordamento da página e mantém controles acessíveis', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Carregar exemplos' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({ path: '.cache/mobile.png', fullPage: true });
  await fillEmployee(page);
  const bounds = await page.getByRole('dialog').boundingBox();
  expect(bounds!.width).toBeLessThan(390);
  await page.screenshot({ path: '.cache/mobile-form.png', fullPage: true });
});
