# Visão Geral do Projeto

- Nome: `my-better-t-app`
- Stack: monorepo com Next.js 16 (React 19), Fastify 5, Prisma 6, PostgreSQL, Turborepo, Tailwind v4, shadcn/ui, Better-Auth
- Objetivo: base full‑stack pronta para autenticação (email/senha e OAuth), UI moderna, servidor rápido e camada de dados tipada.

# Objetivos

- Oferecer autenticação confiável e extensível (email/senha, GitHub, Google)
- Separar responsabilidades entre web (UI), server (API/Auth proxy) e packages (auth, db, config)
- Facilitar evolução (features) com tipagem consistente e build otimizado

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
  - Inicialização: `listen(3000)`
  - Referências: `apps/server/src/index.ts:7-13`, `apps/server/src/index.ts:21-48`, `apps/server/src/index.ts:54-60`
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
- Tipagem compartilhada com `@my-better-t-app/config/tsconfig.base.json`
- ESM em todos os pacotes, strict TS, aliases `@/*`

# Padrões de Código Adotados

- TypeScript estrito, módulos ESM
- Aliases: `@/*` para `src/*` nas apps
- Componentes client para formulários e UI interativa
- Hooks e bibliotecas: TanStack Form/Query, Tailwind utilitário, shadcn/ui

# Requisitos Funcionais

- Autenticação:
  - Email/senha com validação (`zod`) e redirecionamento para `/dashboard`
  - OAuth GitHub/Google com sincronização de email
  - Sessão exposta no client: `useSession`, `getSession`
  - Logout com `authClient.signOut`
- Proteção de páginas:
  - `dashboard` redireciona para `/login` sem sessão

# Fluxo de Lógica e Dados

- Frontend chama `authClient` apontando para `NEXT_PUBLIC_SERVER_URL`
- Server transforma requisição Fastify em `Request` Web, delega ao `auth.handler`
- Better-Auth usa Prisma (PostgreSQL) para persistir usuários, sessões, contas e verificações

# Gargalos, Riscos e Pontos Fracos

- Prop ausente em login: `SignInForm` exige `onSwitchToSignUp`, mas `apps/web/src/app/login/page.tsx:5-27` não passa a prop (potencial erro de tipo/execução)
- Health-check inexistente na Home: seção “API Status” não verifica o servidor; oportunidade de adicionar fetch a `/`
- Configuração sensível via `.env`: `CORS_ORIGIN`, segredos OAuth e `BETTER_AUTH_SECRET` devem estar corretos; risco de CORS bloqueado
- Docker compose usa senha padrão `password` — não usar em produção
- Divergência de README: menciona `packages/api`, inexistente; risco de documentação desatualizada
- Log do Fastify habilitado (`logger: true`): revisar sanitização de logs para evitar dados sensíveis

# Oportunidades de Melhoria

- Passar `onSwitchToSignUp` e `onSwitchToSignIn` entre telas de login/registro
- Implementar componente de status que checa `GET http://localhost:3000/` e exibe latência/estado
- Centralizar configuração de `NEXT_PUBLIC_SERVER_URL` e `CORS_ORIGIN` por ambiente (dev/prod)
- Adicionar testes (unitários para forms, integração para fluxo de auth)
- CI mínima (type‑check, lint, build) via GitHub Actions
- Middleware/guard para páginas protegidas e SSR de sessão
- Observabilidade: métricas básicas no server (p99, throughput) e tracing opcional

# Plano de Evolução

- Curto prazo:
  - Corrigir props dos formulários de auth e UX de alternância login/registro
  - Health‑check da API na Home e página de status
  - Hardening de CORS e `trustedOrigins` com múltiplas origens (dev/prod)
- Médio prazo:
  - Testes e2e do fluxo de autenticação (Playwright/Cypress)
  - Roles/permissions simples no modelo e guardas no client/server
  - Pipeline CI/CD com verificação de tipos e migrations automatizadas
- Longo prazo:
  - Observabilidade (logs estruturados, métricas, tracing)
  - Segurança: rotação de segredos, revisão de exposição de headers

# Alterações Recentes

- Corrigida alternância entre Login/Registro na página de login, passando as props e controlando estado local (`apps/web/src/app/login/page.tsx:1-36`).
- Ajustado `authClient` com fallback de `baseURL` para dev (`apps/web/src/lib/auth-client.ts:5-8`).
- Corrigida configuração de Better-Auth para provedores sociais usando `socialProviders` e remoção de `syncUser` inválido (`packages/auth/src/index.ts:5-29`).
- Adicionado indicador de status da API na Home com verificação de disponibilidade e latência (`apps/web/src/app/page.tsx:19-60`).
- Implementado polling de status a cada 10s e exibição de detalhes de erro quando offline (`apps/web/src/app/page.tsx:33-44`, `apps/web/src/app/page.tsx:54-60`).
- Ajustado UI base do `Button` para exibir cursor de clique (pointer) em todos os variantes (`apps/web/src/components/ui/button.tsx:7-36`).

# Rotas e Proteções

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
