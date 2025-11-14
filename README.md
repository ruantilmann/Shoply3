# my-better-t-app

Monorepo moderno baseado em TypeScript com Next.js 16 (React 19), Fastify 5, Prisma 6, PostgreSQL, Better-Auth e Turborepo.

## Principais Tecnologias

- Next.js (App Router) com Tailwind CSS v4 e shadcn/ui
- Fastify (Node.js) como servidor da API e proxy de autenticação
- Prisma ORM com PostgreSQL
- Better-Auth (email/senha + OAuth GitHub/Google)
- Turborepo para orquestração de workspaces e tarefas

## Estrutura do Projeto

```
my-better-t-app/
├── apps/
│   ├── web/           # Frontend (Next.js)
│   └── server/        # Backend (Fastify) + proxy Better-Auth
├── packages/
│   ├── auth/          # Instância e configuração do Better-Auth
│   ├── db/            # Prisma schema, client e scripts de banco
│   └── config/        # tsconfig base compartilhado
├── PROJECT_CONTEXT.md # Contexto arquitetural e decisões
├── turbo.json         # Pipeline Turborepo
└── package.json       # Workspaces e scripts globais
```

## Configuração de Ambiente

1. Instalar dependências:

```bash
npm install
```

2. Configurar variáveis de ambiente:

- `apps/server/.env`:
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL` (ex.: `http://localhost:3000`)
  - `CORS_ORIGIN` (ex.: `http://localhost:3001`)
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

- `apps/web/.env`:
  - `NEXT_PUBLIC_SERVER_URL` (ex.: `http://localhost:3000`)

Os arquivos `.env` não são versionados. Use os `.env.example` como referência.

## Banco de Dados (Dev)

Com Docker:

```bash
npm run db:start        # sobe o postgres
npm run db:generate     # gera o client do Prisma
npm run db:push         # aplica o schema
```

Ferramentas:

```bash
npm run db:studio       # abre Prisma Studio
npm run db:stop         # para containers
npm run db:down         # remove containers
```

## Desenvolvimento

```bash
npm run dev
```

- Web: `http://localhost:3001`
- API: `http://localhost:3000`

A Home exibe um indicador de status da API (com polling a cada 10s) para evitar inconsistências nos botões de autenticação.

## Fluxo de Autenticação

- O servidor (`apps/server`) expõe o Better-Auth via proxy em `GET|POST /api/auth/*`.
- O cliente (`apps/web/src/lib/auth-client.ts`) consome usando `NEXT_PUBLIC_SERVER_URL`.
- Email/senha e GitHub/Google estão habilitados.
- Rotas protegidas:
  - `/dashboard`
  - `/welcome` (boas‑vindas com dados do usuário)

## Comportamento de UI

- O Header é ocultado na rota `/login` para foco nas telas de autenticação.
- Botões possuem `cursor-pointer` e feedback visual consistente.

## Scripts Disponíveis (raiz)

- `npm run dev` — inicia todos os apps
- `npm run build` — build de todos os apps/pacotes
- `npm run dev:web` — inicia apenas o web
- `npm run dev:server` — inicia apenas o server
- `npm run check-types` — verificação de tipos TypeScript
- `npm run db:*` — comandos de banco via package `@my-better-t-app/db`

## Segurança e Boas Práticas

- Não versionar `.env`; configure variáveis por ambiente.
- Defina `CORS_ORIGIN` corretamente (dev/prod) e restrinja origens confiáveis.
- Em produção, use segredos fortes e não utilize credenciais padrão do Docker.
- Evite logar informações sensíveis; revise logs antes de deploy.

## Observações

- O projeto usa ESM e TypeScript estrito em todos os pacotes.
- Next habilita `typedRoutes` e `reactCompiler`.
- O contexto do projeto está em `PROJECT_CONTEXT.md` e deve ser atualizado sempre que o projeto mudar.
