# Átrio

O hall da suíte. Um login, um pacote (Full / Comercial / Operação) e os sistemas no mesmo launchpad — como um produto, não cinco demos soltas.

Backend em NestJS (Clean Architecture), frontend em React + Vite, PostgreSQL e Prisma.

---

## O que o produto faz

- Login único (JWT access + refresh)
- Catálogo dos sistemas: VendaCore, Smarty, Kanban, Discador, Chat Observability e o chat
- Pacotes que liberam módulos (`FULL`, `COMERCIAL`, `OPERACAO`)
- Recrutador e admin veem a suíte inteira; member só o que o pacote inclui
- Clique no card → auditoria + URL da demo + credenciais
- Admin troca o pacote de uma pessoa e o launchpad muda

---

## Arquitetura

```text
Controller (presentation)
  → Use Case (application)
    → Port / repository (domain)
      → Prisma repository (infrastructure)
```

O catálogo e as regras de entitlement ficam no domínio (`suite-catalog.ts`). Prisma só persiste usuário, refresh token e `AccessLog`.

---

## Tecnologias

- **Backend:** Node.js 20, NestJS 10, TypeScript strict, Prisma, PostgreSQL 16, Passport JWT, Jest
- **Frontend:** React 18, Vite, Tailwind, Zustand, Axios
- **Demo:** Vercel estática com `VITE_DEMO=true` (API mockada no `localStorage`)

---

## Como rodar

Pré-requisitos: Node.js ≥ 20, Docker Compose, npm.

### 1. Postgres

Na raiz `access-hub/`:

```bash
docker compose up -d postgres
```

Porta **5436**.

### 2. Backend (porta 3003)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

- API: http://localhost:3003/api/v1
- Health: http://localhost:3003/api/v1/health
- Swagger: http://localhost:3003/api/docs

### 3. Frontend (porta 5174)

```bash
cd frontend
cat << 'EOF' > .env.local
VITE_API_URL=http://localhost:3003/api/v1
EOF
npm install
npm run dev
```

App: http://localhost:5174

### Contas do seed

| E-mail | Senha | Papel | Pacote |
|---|---|---|---|
| `recruiter@atrio.dev` | `password123` | RECRUITER | Full (vê tudo + auditoria) |
| `admin@atrio.dev` | `password123` | ADMIN | Full (troca pacotes) |
| `comercial@atrio.dev` | `password123` | MEMBER | Comercial (ERP + loja + chat) |
| `operacao@atrio.dev` | `password123` | MEMBER | Operação (Discador + Kanban + chat) |

## Demo na Vercel (sem backend)

O frontend sobe sozinho. Com `VITE_DEMO=true` a API é mockada no browser.

1. No [Vercel](https://vercel.com/new) importe `exkgred/acess-hub`
2. **Root Directory:** `frontend` (ou deixe a raiz: o `vercel.json` já builda `frontend`)
3. Framework: Vite
4. Variável: `VITE_DEMO=true` (já vem em `frontend/.env.production`)

Login da demo: `recruiter@atrio.dev` / `password123` (já vem preenchido).

Código: [https://github.com/exkgred/acess-hub](https://github.com/exkgred/acess-hub)

---

## Testes

```bash
cd backend
npm test
npm run test:cov
npm run lint
```

Cobre login, launchpad (entitlements por pacote), launch 403/404 e auditoria.

---

## Contrato da API (`/api/v1`)

Rotas autenticadas usam `Authorization: Bearer <accessToken>`. Envelope:

```json
{ "success": true, "data": {}, "meta": { "timestamp": "...", "requestId": "..." } }
```

### Health
- `GET /health` — público

### Auth
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Hub
- `GET /workspace` — pacote + catálogo com `entitled`
- `POST /apps/:slug/launch` — auditoria + URL da demo
- `GET /audit?page=&perPage=` — member vê só os próprios
- `GET /users` — admin e recruiter
- `PATCH /users/:id/package` — só admin
