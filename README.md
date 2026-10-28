# Quadro · Funcionários e IRRF

[![CI](https://github.com/Railson25/teste-seidor/actions/workflows/ci.yml/badge.svg)](https://github.com/Railson25/teste-seidor/actions/workflows/ci.yml)

Aplicação do desafio técnico para Desenvolvedor FrontEnd SR: cadastro de funcionários e cálculo mensal de IRRF. Desenvolvida com React, TypeScript estrito e Context API, usando apenas React e React DOM como dependências de produção.

## Preparar o projeto

Requisitos: **Node.js 24.x**, npm e Git. A versão principal está registrada em `.nvmrc`.

```bash
git clone https://github.com/Railson25/teste-seidor.git
cd teste-seidor
npm ci
```

O download das dependências requer acesso à internet. A aplicação funciona localmente sem arquivo `.env`, conta, backend ou serviço externo.

## Desenvolvimento

```bash
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173`. Mantenha o terminal aberto; use `Ctrl+C` para encerrar. Se a porta estiver ocupada, o Vite informa outra porta disponível.

## Build e preview de produção

```bash
npm run build
npm run preview
```

O build valida o TypeScript e gera a distribuição em `dist/`. Abra o endereço informado pelo preview, normalmente `http://127.0.0.1:4173`. O preview serve para verificar o build localmente; não publica a aplicação.

O armazenamento é separado por origem: desenvolvimento na porta 5173 e preview na porta 4173 possuem cadastros independentes. Dentro da mesma origem, recarregar a página preserva os dados.

## Roteiro para avaliação

1. Clique em **Carregar exemplos**. São três identidades demonstrativas, com cálculos em faixas diferentes. Repetir o carregamento preserva os cadastros e não duplica CPFs.
2. Cadastre um funcionário informando nome, CPF, salário bruto, previdência e dependentes. Use valores como `5000,00` ou `5000.00`, sem separador de milhar.
3. Confira a base de cálculo e o IRRF na tabela; abra **Cálculo** para consultar a memória.
4. Edite valores e verifique o recálculo. Combine filtros por nome e CPF e confira a paginação.
5. Recarregue a página para verificar a persistência; experimente cancelar e confirmar uma exclusão.
6. Navegue usando Tab, Shift+Tab e Escape; confira o layout móvel. A tabela permite rolagem horizontal sem transbordar a página.

## Regras implementadas

O projeto utiliza **a tabela fornecida no enunciado**, independentemente da legislação fiscal vigente. O desconto previdenciário é informado manualmente; não há cálculo automático de INSS.

| Base de cálculo           | Alíquota | Parcela a deduzir |
| ------------------------- | -------: | ----------------: |
| Até R$ 2.259,20           |   Isento |           R$ 0,00 |
| R$ 2.259,21 a R$ 2.826,65 |     7,5% |         R$ 169,44 |
| R$ 2.826,66 a R$ 3.751,05 |      15% |         R$ 381,44 |
| R$ 3.751,06 a R$ 4.664,68 |    22,5% |         R$ 662,77 |
| Acima de R$ 4.664,68      |    27,5% |         R$ 896,00 |

```text
Dedução por dependente = R$ 189,59
Base = máximo(0, salário bruto − previdência − dependentes × dedução)
IRRF = máximo(0, base × alíquota − parcela a deduzir)
```

Cada limite superior é inclusivo. Valores monetários são representados por centavos inteiros e alíquotas por pontos-base inteiros. O imposto final é arredondado ao centavo, com meio centavo para cima; não há arredondamentos intermediários da base.

**Exemplo verificável:** salário de R$ 5.000,00, previdência de R$ 500,00 e dois dependentes resultam em base de R$ 4.120,82, alíquota de 22,5%, parcela de R$ 662,77 e IRRF de **R$ 264,41**.

Validações: nome não vazio com até 120 caracteres, CPF com verificadores válidos e único, dinheiro com até duas casas decimais, previdência até o salário bruto e dependentes inteiros não negativos. O teto monetário por campo é R$ 999.999.999,99, mantendo os cálculos no intervalo seguro dos inteiros JavaScript. Zero é aceito para salário e previdência.

## Organização por features

O código se organiza em três partes: a composição da aplicação, funcionalidades independentes e recursos compartilhados. A funcionalidade de funcionários contém tudo que lhe pertence, incluindo IRRF e persistência.

```text
src/
  app/
    App.tsx                    Composição da aplicação
    AppLayout.tsx              Cabeçalho, rodapé e conteúdo principal
    AppLayout.module.css
  features/
    employees/
      components/              Formulário, tabela, resumo e memória de cálculo
      constants/               Tabela IRRF, limites, campos e paginação
      context/                 Contextos, provider e reducer
      data/                    Exemplos fictícios
      helpers/                 Validações, cálculo, filtros e conversão de formulário
      hooks/                   Estado da interface e acesso ao Context
      storage/                 Leitura e gravação dos funcionários no navegador
      types/                   Modelos e contratos internos
      EmployeesPage.tsx        Coordenação dos fluxos da funcionalidade
      EmployeesPage.module.css
      index.ts                 Entrada pública: exporta somente EmployeesPage
  shared/
    ui/
      Button/                  Botões com variantes e atributos nativos
      TextField/               Campo, rótulo, ajuda e erro associados
      Dialog/                  Diálogo nativo e gerenciamento de foco
      ConfirmDialog/           Confirmação genérica por composição
      FeedbackMessage/         Mensagens acessíveis e ações opcionais
    styles/                    Tokens visuais, reset e utilitários globais
    utils/                     Moeda e normalização genérica de texto
  test/                        Setup e verificação dos limites arquiteturais
  main.tsx                     Inicialização do React e estilos globais
e2e/                           Fluxos completos no build de produção
```

### Dependências e entrada pública

```mermaid
flowchart TD
  Main[main.tsx] --> App[app/App]
  App --> Layout[AppLayout]
  App --> Entry[features/employees/index.ts]
  Entry --> Page[EmployeesPage]
  Page --> Components[Componentes de funcionários]
  Page --> Hooks[Hooks da feature]
  Components --> UI[shared/ui]
  Hooks --> Context[Context e reducer]
  Hooks --> Helpers[Helpers da feature]
  Context --> Storage[Storage da feature]
  Storage --> Helpers
  Helpers --> Utils[shared/utils]
  UI --> Styles[shared/styles]
```

- **Aplicação:** importa a feature pela pasta pública, por exemplo `import { EmployeesPage } from '../features/employees'`. Não acessa seus hooks, tipos ou armazenamento internos. O provider é montado pela própria página.
- **Feature:** reúne seus componentes, regras e estado. Uma nova funcionalidade terá sua própria pasta e entrada pública, sendo composta em `app`. Features não dependem de `app` nem de outras features; uma necessidade de coordenação pertence à composição da aplicação.
- **Compartilhado:** não conhece funcionários ou IRRF. Formatação de moeda e normalização de texto são genéricas; formatação e validação de CPF permanecem em funcionários. Props exclusivas de componentes ficam junto deles; contratos internos compartilhados ficam em `types` da feature.
- **Verificação:** o ESLint bloqueia dependências de `shared` para `app/features`, imports internos de features pela aplicação e dependências de features para `app`. Testes de arquitetura verificam os imports resolvidos, o isolamento entre features e a ausência de ciclos.

### Estado, cálculo e persistência

- **Cálculo e validações puros:** helpers independentes de React e do navegador. Base e imposto são derivados, evitando resultados armazenados que possam ficar desatualizados.
- **Hooks:** `useEmployeeForm` coordena valores, validação e foco; `useEmployeeTable` coordena filtros e paginação; `useEmployees` e `useEmployeeActions` encapsulam o acesso aos contextos. Os componentes apresentam dados e encaminham interações.
- **Context + reducer:** atende ao requisito do teste. O reducer preserva imutabilidade; contextos separados expõem dados e ações. A persistência ocorre nas ações, fora do reducer. Uma referência interna serializa ações antes da próxima renderização do React, mantendo memória e armazenamento consistentes em operações sucessivas.
- **Storage:** conserva a chave `quadro.employees.v1` e o formato `{ version: 1, employees: [...] }`. A reorganização não exige migração dos cadastros existentes. A leitura valida dados, IDs e CPFs duplicados. Conteúdo corrompido ou de versão desconhecida não é sobrescrito automaticamente; a interface permite redefinir explicitamente o armazenamento com os dados da sessão.

### Componentes, UI e desempenho

- **UI reutilizável:** `Button` usa `type="button"` por padrão e aceita submissão explícita, referência e atributos nativos. `TextField` associa rótulo, ajuda e erro ao campo, preservando descrições adicionais, eventos e referência.
- **Diálogos e mensagens:** `Dialog` mantém Escape, navegação por Tab e retorno de foco; `ConfirmDialog` recebe conteúdo e callbacks, deixando a exclusão com a feature. `FeedbackMessage` anuncia sucesso, aviso e erro e aceita ações por composição.
- **Estilos:** tokens centralizam cores, espaçamentos, tipografia e foco. CSS Modules pertencem aos componentes, ao layout e à página; o CSS global mantém reset, controles nativos básicos e utilitários acessíveis. O painel preserva o visual e os fluxos anteriores. A fonte é do sistema, sem requisições externas.
- **Dependências proporcionais:** apenas React e React DOM em produção. Sem biblioteca adicional de UI, formulários, estado, máscaras, moeda ou roteamento. Ferramentas de lint, formatação, testes e acessibilidade ficam em desenvolvimento.
- **Desempenho:** filtros e resumo memorizados; renderização de até 50 linhas; formatador monetário reutilizado. Busca ignora acentos e caixa, e o filtro de CPF ignora pontuação. A paginação se ajusta após filtros e remoções.

O volume esperado é o de uma avaliação frontend. Filtrar e salvar a coleção inteira continua sendo O(n), e `localStorage` é síncrono e limitado pelo navegador. Para múltiplos usuários ou grande volume, a evolução seria uma API com autorização, banco de dados e paginação/filtros no servidor, preservando os helpers de cálculo e substituindo o armazenamento dentro da feature. Essa infraestrutura não faz parte do desafio.

## Testes rápidos e verificações

Após `npm ci`, execute:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

## Testes E2E no navegador

Instale o Chromium do Playwright uma vez e gere o build antes de executar os testes:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Em Linux, caso faltem bibliotecas do sistema, use `npx playwright install --with-deps chromium`.

| Camada                      | Ferramenta                         | Cenários                                                                                                                                                 |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regras e estado             | Vitest                             | Todas as fronteiras de faixa, arredondamento, isenção, deduções, validações, imutabilidade, importação idempotente e armazenamento inválido/indisponível |
| Context e persistência      | Vitest + React Testing Library     | Ações sucessivas no mesmo evento, recarga do estado, recuperação de quota e redefinição de armazenamento corrompido em StrictMode                        |
| Interface                   | React Testing Library + user-event | Erros e foco no formulário, valores em centavos, edição, cancelamento, exclusão confirmada, filtros e paginação após redução da lista                    |
| Navegador real              | Playwright / Chromium              | CRUD completo, recálculo, recarga, CPF duplicado, corrupção, falha de escrita, navegação do diálogo e layout móvel                                       |
| Acessibilidade automatizada | axe                                | Regras WCAG A/AA no painel vazio e preenchido, formulário inválido, memória de cálculo e tela móvel                                                      |

Os contratos dos componentes compartilhados também são testados: submissão explícita de botões, referências e eventos nativos, associação de ajuda/erro e confirmação/cancelamento. As verificações arquiteturais fazem parte de `npm test`.

`npm run test:watch` inicia o modo interativo. `npm run format` aplica a formatação. Os E2E usam um navegador isolado e iniciam `vite preview` automaticamente na porta 4173; não é necessário iniciar o servidor manualmente. Quando já existe um preview nessa porta, ele é reutilizado localmente. Gere novamente o build se alterar o código. Evidências de falhas ficam em `test-results/` e `playwright-report/`, ignoradas pelo Git. Screenshots de inspeção ficam em `.cache/`.

A CI executa instalação reproduzível, formatação, lint, tipos, testes, build e E2E em Linux com Node 24. Actions são fixadas por SHA e o token do workflow possui apenas leitura do repositório. Diagnósticos de falha são retidos por sete dias. A auditoria automática não substitui avaliação completa com tecnologias assistivas; teclado, foco e layout também foram inspecionados durante o desenvolvimento.

## Segurança e limites

Os dados ficam no navegador de cada visitante, sem transmissão a um backend, analytics ou logs da aplicação. Entradas são renderizadas como texto pelo React, sem HTML arbitrário. CPF válido significa apenas que seus verificadores são corretos, não que a identidade foi confirmada.

O armazenamento local **não é criptografado nem protegido por autenticação**. Scripts da mesma origem e pessoas com acesso ao perfil do navegador podem lê-lo. Use dados fictícios na avaliação. Limpar os dados do navegador remove os cadastros; não há backup, sincronização entre dispositivos ou coordenação de alterações entre abas. Em falhas de gravação, as operações continuam em memória com aviso explícito.

O projeto é entregue como repositório público, sem hospedagem da aplicação. Não é um sistema de folha de pagamento para uso em produção.

## Histórico

Os commits seguem Conventional Commits e separam configuração, regras de cálculo, persistência, CRUD, filtros, exemplos, apresentação, arquitetura por features, UI compartilhada, testes, correções, CI e documentação. Consulte `git log --oneline --reverse` para acompanhar a evolução.
