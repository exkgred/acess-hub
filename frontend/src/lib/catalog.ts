import type { AppSlug, PackageSlug, SuiteApp, SuitePackage } from './types'

export const SUITE_APPS: SuiteApp[] = [
  {
    slug: 'vendacore',
    name: 'VendaCore ERP',
    tagline: 'Cadastros, vendas, estoque e financeiro',
    description: 'ERP multiempresa com JWT, RBAC e fluxo Orçamento → Pedido → Faturamento.',
    stack: '.NET 8 · React · PostgreSQL',
    url: 'https://reat-erp.vercel.app/',
    github: 'https://github.com/exkgred/reat-erp',
    category: 'comercial',
    packages: ['FULL', 'COMERCIAL'],
    credentials: { email: 'admin@vendacore.com', password: 'password123' },
  },
  {
    slug: 'nexo',
    name: 'Nexo CRM',
    tagline: 'Funil, jornada e bus de eventos',
    description:
      'Lead do Discador/chat vira oportunidade; ganho dispara handoff ao VendaCore. Outbox com ingest da suíte.',
    stack: 'NestJS · React · PostgreSQL',
    url: 'https://nexo-theta-ten.vercel.app/',
    github: 'https://github.com/exkgred/nexo',
    category: 'comercial',
    packages: ['FULL', 'COMERCIAL'],
    credentials: { email: 'ana@nexo.dev', password: 'password123' },
  },
  {
    slug: 'smarty',
    name: 'Smarty Hardware',
    tagline: 'Loja, checkout e painel de balcão',
    description: 'E-commerce de peças de PC com CEP, pagamentos fictícios e venda no balcão.',
    stack: 'Laravel 11 · Vue 3 · MySQL',
    url: 'https://smarty-hardware.vercel.app/',
    github: 'https://github.com/exkgred/smarty-hardware',
    category: 'comercial',
    packages: ['FULL', 'COMERCIAL'],
    credentials: { email: 'admin@marketplace.test', password: 'password' },
  },
  {
    slug: 'kanban',
    name: 'Kanban Board',
    tagline: 'Sprints, tags e apontamento de horas',
    description: 'Quadro em tempo real com WebSocket, Play/Pause e feed de atividades.',
    stack: 'NestJS · Next.js · PostgreSQL',
    url: 'https://kanban-pro-delta.vercel.app/',
    github: 'https://github.com/exkgred/kanban-pro',
    category: 'operacao',
    packages: ['FULL', 'OPERACAO'],
    credentials: { email: 'demo@kanban.dev', password: 'Demo1234!' },
  },
  {
    slug: 'discador',
    name: 'Discador Zenvia',
    tagline: 'Fila, click-to-call e power dialer',
    description: 'Call center com API de Voz da Zenvia, wrap-up e lista Não Me Perturbe.',
    stack: 'NestJS · React · Redis',
    url: 'https://discador-amber.vercel.app/',
    github: 'https://github.com/exkgred/discador',
    category: 'operacao',
    packages: ['FULL', 'OPERACAO'],
    credentials: { email: 'agent@discador.dev', password: 'password123' },
  },
  {
    slug: 'observability',
    name: 'Chat Observability',
    tagline: 'KPIs, ingest e Grafana Loki',
    description: 'Painel das conversas do chatbot, com logs assíncronos e série de 14 dias.',
    stack: 'Next.js · Postgres · Loki',
    url: 'https://chat-observability.vercel.app/',
    github: 'https://github.com/exkgred/chat-observability',
    category: 'plataforma',
    packages: ['FULL'],
    credentials: null,
  },
  {
    slug: 'chat',
    name: 'Chat do portfólio',
    tagline: 'Agente Cohere com a base de conhecimento',
    description: 'Visitante conversa em linguagem natural; o log segue depois para o painel.',
    stack: 'Vercel · Cohere Command A',
    url: 'https://chatbot-cohere-theta.vercel.app/',
    github: 'https://github.com/exkgred/chatbot-cohere',
    category: 'plataforma',
    packages: ['FULL', 'COMERCIAL', 'OPERACAO'],
    credentials: null,
  },
]

export const SUITE_PACKAGES: SuitePackage[] = [
  {
    slug: 'FULL',
    name: 'Full',
    description: 'Todos os módulos da suíte, incluindo observabilidade.',
    appSlugs: SUITE_APPS.map((app) => app.slug),
  },
  {
    slug: 'COMERCIAL',
    name: 'Comercial',
    description: 'ERP, CRM e loja para quem vende e fatura.',
    appSlugs: SUITE_APPS.filter((app) => app.packages.includes('COMERCIAL')).map((app) => app.slug),
  },
  {
    slug: 'OPERACAO',
    name: 'Operação',
    description: 'Discador e Kanban para o time que executa.',
    appSlugs: SUITE_APPS.filter((app) => app.packages.includes('OPERACAO')).map((app) => app.slug),
  },
]

export function findApp(slug: string): SuiteApp | undefined {
  return SUITE_APPS.find((app) => app.slug === slug)
}

export function findPackage(slug: PackageSlug): SuitePackage {
  return SUITE_PACKAGES.find((item) => item.slug === slug) ?? SUITE_PACKAGES[0]
}

export function appLabel(slug: AppSlug | string): string {
  return findApp(slug)?.name ?? slug
}
