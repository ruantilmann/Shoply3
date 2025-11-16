# Visão Geral do Projeto

- Nome: `Shoply3`
- Stack: monorepo com Next.js 16 (React 19), Fastify 5, Prisma 6, PostgreSQL, Turborepo, Tailwind v4, shadcn/ui, Better-Auth
- Objetivo: app de lista de compras com foco em usabilidade, sincronização entre dispositivos e colaboração.

# Objetivos

- Permitir criar e gerenciar múltiplas listas de compras
- Adicionar itens com quantidade, unidade, preço previsto e categoria
- Marcar itens como comprados e calcular totais (previsto vs. real)
- Autenticação para sincronização e compartilhamento de listas

# Estrutura da Aplicação

- `apps/web`: aplicação Next.js (App Router) e cliente de autenticação
- `apps/server`: servidor Fastify expondo rotas de autenticação do Better-Auth via proxy
- `packages/auth`: configuração do Better-Auth com Prisma
- `packages/db`: schema Prisma, geração do client e instância `PrismaClient`
- `packages/config`: `tsconfig.base.json` compartilhado
- Raiz: `turbo.json`, `package.json` (workspaces), `bts.jsonc`

# Principais Arquivos e Módulos

- Servidor Fastify: `apps/server/src/index.ts`
  - CORS base (origem, métodos, headers)
  - Proxy de auth: `GET|POST /api/auth/*` chama `auth.handler`
  - Sessão: usa `auth.api.getSession(request, reply)` para obter a sessão nas rotas
  - API de Listas: `GET /api/lists` (lista do usuário) e `POST /api/lists` (cria lista)
    - Encaminha `cookie`, `origin`, `x-forwarded-*` para validar sessão
    - Usa `randomUUID()` para `id`
  - Inicialização: `listen(3000)`
  - Referências: `apps/server/src/index.ts:50-140` (sessão em `apps/server/src/index.ts:70`)
- Better-Auth: `packages/auth/src/index.ts`
  - `betterAuth` com `prismaAdapter(prisma)`
  - Provedores: email/senha, GitHub, Google
  - `trustedOrigins` via `CORS_ORIGIN`
  - Referências: `packages/auth/src/index.ts:5-29`
- Prisma/DB:
  - Datasource e generator: `packages/db/prisma/schema/schema.prisma:1-11`
  - Modelos de auth: `packages/db/prisma/schema/auth.prisma:1-59`
  - Export do client: `packages/db/src/index.ts:1-4`
- Web/Next:
  - Cliente de auth: `apps/web/src/lib/auth-client.ts:5-8`
  - Layout e providers: `apps/web/src/app/layout.tsx:22-41`, `apps/web/src/components/providers.tsx:6-18`
  - Login: `apps/web/src/app/login/page.tsx:5-27`, forms `sign-in-form.tsx`, `sign-up-form.tsx`
  - Proteção de rota: `apps/web/src/app/dashboard/page.tsx:6-16`
  - Menu usuário e sign out: `apps/web/src/components/user-menu.tsx:15-29`, `apps/web/src/components/user-menu.tsx:31-59`

# Decisões Técnicas Importantes

- Monorepo com Turborepo: pipelines de `dev`, `build`, tarefas de DB
- Build com Tsdown para server e packages (ESM, dts para libs)
- Next habilita `typedRoutes` e `reactCompiler`
- Tipagem compartilhada com `@shoply3/config/tsconfig.base.json` ou via caminho relativo `packages/config/tsconfig.base.json`
- ESM em todos os pacotes, strict TS, aliases `@/*`

# Padrões de Código Adotados

- TypeScript estrito, módulos ESM
- Aliases: `@/*` para `src/*` nas apps
- Componentes client para formulários e UI interativa
- Hooks e bibliotecas: TanStack Form/Query, Tailwind utilitário, shadcn/ui

# Requisitos Funcionais

- Listas:
  - Criar, editar e excluir listas
  - Adicionar itens com quantidade e unidade, editar preço previsto
  - Marcar itens como comprados e calcular total da lista
  - Categorizar itens e ordenar por corredor/mercado
- Sincronização:
  - Autenticação opcional (email/senha, GitHub/Google) para salvar e sincronizar listas
  - Compartilhamento de listas com outros usuários (futuro)

# Fluxo de Lógica e Dados

- Frontend gerencia listas e itens com estado local, persistência e sincronização via API
- Server expõe autenticação com `auth.handler` e endpoints para dados de listas/itens
- Prisma modela usuários, listas, itens e estados de compra

# Gargalos, Riscos e Pontos Fracos

- Prop ausente em login: `SignInForm` exige `onSwitchToSignUp`, mas `apps/web/src/app/login/page.tsx:5-27` não passa a prop (potencial erro de tipo/execução)
- Health-check inexistente na Home: seção “API Status” não verifica o servidor; oportunidade de adicionar fetch a `/`
- Configuração sensível via `.env`: `CORS_ORIGIN`, segredos OAuth e `BETTER_AUTH_SECRET` devem estar corretos; risco de CORS bloqueado
- Docker compose usa senha padrão `password` — não usar em produção
- Divergência de README: menciona `packages/api`, inexistente; risco de documentação desatualizada
- Log do Fastify habilitado (`logger: true`): revisar sanitização de logs para evitar dados sensíveis

# Oportunidades de Melhoria

- Offline‑first com sincronização e resolução de conflitos
- Templates de listas e histórico de compras
- Scanner de código de barras e sugestões de preços
- Centralização de configurações por ambiente (dev/prod)
- Métricas e tracing no server para desempenho das operações de listas

# Plano de Evolução

- Curto prazo:
  - Modelos de `lista` e `item` no Prisma e rotas básicas de CRUD
  - UI para criação/edição de listas e marcação de itens como comprados
  - Persistência local com fallback quando offline
- Médio prazo:
  - Compartilhamento de listas e permissões simples
  - Histórico e templates reutilizáveis
  - Testes e2e para operações críticas de listas/itens
- Longo prazo:
  - Offline‑first completo e resolução de conflitos
  - Observabilidade e segurança de dados

# Alterações Recentes

- Modelo `List` adicionado e relação `User.lists` (`packages/db/prisma/schema/auth.prisma:1-59`).
- API de listas criada: `GET/POST /api/lists` com verificação de sessão e encaminhamento de `cookie`/`origin` (`apps/server/src/index.ts:70-138`).
- Sessão do Better‑Auth centralizada nas rotas via `auth.api.getSession(request, reply)`; problema de 401 resolvido.
- Home exibe listas do usuário autenticado, com botão flutuante “+” e modal para criar lista (`apps/web/src/app/page.tsx:1-160`).
- Proteção: Home redireciona não autenticado para `/login`; `/login` redireciona autenticado para `/` (`apps/web/src/app/page.tsx:26-34`, `apps/web/src/app/login/page.tsx:11-22`).
- Renomeação de pacotes internos para `@shoply3/*` e mapeamentos de `tsconfig` via caminhos relativos.
- Banco mantido como `my-better-t-app` nos `.env` e Docker.
- Correções: uso de `randomUUID` no server, `trustedOrigins` com fallback, normalização de `baseURL` e mensagens de erro mais detalhadas na Home.

# Rotas e Proteções

- Home `/` exige sessão; sem sessão, redireciona para `/login` (`apps/web/src/app/page.tsx:26-34`).
- `/login` redireciona usuário autenticado para `/` (`apps/web/src/app/login/page.tsx:11-22`).
- Rota protegida de boas‑vindas: `/welcome` exige usuário autenticado e exibe dados do usuário (`apps/web/src/app/welcome/page.tsx:1-41`).
- Link adicionado no Header para navegação rápida (`apps/web/src/components/header.tsx:7-32`).
- Ocultação do Header na rota de login/registro via wrapper client com `usePathname` (`apps/web/src/components/app-header.tsx:1-11`, `apps/web/src/app/layout.tsx:22-41`).
- README atualizado para refletir estado atual do projeto (estrutura, ambiente, banco, desenvolvimento, fluxo de autenticação, UI e segurança) (`README.md:1-102`).
- Correções de cursor: `DropdownMenuItem` e `SubTrigger` passam a exibir `cursor-pointer`; botão “Verificar agora” também (`apps/web/src/components/ui/dropdown-menu.tsx:62-82`, `apps/web/src/components/ui/dropdown-menu.tsx:201-223`, `apps/web/src/app/page.tsx:48-52`).
- Link do email no menu do usuário abre a tela de cadastro (`apps/web/src/components/user-menu.tsx:37-58`).
- Tela de alteração de cadastro criada em `/account`, com formulário para nome e imagem, usando `authClient.updateUser` (`apps/web/src/app/account/page.tsx:1-35`, `apps/web/src/components/account-form.tsx:1-96`).
- Ajustes de tipagem: validação `image` sem `optional` para compatibilidade com TanStack Form e correção dos botões sociais para `signIn.social({ provider })` (`apps/web/src/components/account-form.tsx:19-24`, `apps/web/src/components/social-sign-in.tsx:7-13`).

# Troubleshooting

- Problema: Cursor não muda para “clique” (pointer) ao passar o mouse sobre botões na página de login
  - Sintomas: “Need an account? Sign Up”, “Sign in with GitHub”, “Sign in with Google” exibiam cursor padrão ao hover
  - Causa raiz: Componente base `Button` sem a classe `cursor-pointer`, mantendo o cursor padrão nos navegadores
  - Solução aplicada: Adicionado `cursor-pointer` na classe base do `Button` (`apps/web/src/components/ui/button.tsx:7-36`)
  - Verificação: Hover em todos os botões mostra cursor de clique; estado `disabled` continua respeitando `pointer-events:none`
  - Follow-up sugerido:
    - Auditar elementos que usam `asChild` com `Button` para garantir que o cursor permaneça consistente
    - Criar um teste visual (Playwright) verificando cursor em variantes de `Button`
    - Definir guideline de UX para elementos interativos exigirem `cursor-pointer` quando apropriado


# Variáveis de Ambiente

- Server: `apps/server/.env.example` — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, credenciais OAuth
- Web: `apps/web/.env.example` — `NEXT_PUBLIC_SERVER_URL`
- Prisma: `packages/db/prisma/schema/schema.prisma` usa `env("DATABASE_URL")`

# Como Executar

- Instalação: `npm install`
- Banco: `npm run db:start` (Docker), `npm run db:push`, `npm run db:generate`
- Desenvolvimento: `npm run dev` (web em `http://localhost:3001`, server em `http://localhost:3000`)
