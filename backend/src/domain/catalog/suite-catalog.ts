import type { PackageSlug, User, UserRole } from '../entities/user.entity';

export type AppSlug =
  'vendacore' | 'smarty' | 'kanban' | 'discador' | 'observability' | 'chat';

export interface AppCredentials {
  email: string;
  password: string;
  hint?: string;
}

export interface SuiteApp {
  slug: AppSlug;
  name: string;
  tagline: string;
  description: string;
  stack: string;
  url: string;
  github: string;
  category: 'comercial' | 'operacao' | 'plataforma';
  packages: PackageSlug[];
  credentials: AppCredentials | null;
}

export interface SuitePackage {
  slug: PackageSlug;
  name: string;
  description: string;
  appSlugs: AppSlug[];
}

export const SUITE_APPS: SuiteApp[] = [
  {
    slug: 'vendacore',
    name: 'VendaCore ERP',
    tagline: 'Cadastros, vendas, estoque e financeiro',
    description:
      'ERP multiempresa com JWT, RBAC e fluxo Orçamento → Pedido → Faturamento.',
    stack: '.NET 8 · React · PostgreSQL',
    url: 'https://reat-erp.vercel.app/',
    github: 'https://github.com/exkgred/reat-erp',
    category: 'comercial',
    packages: ['FULL', 'COMERCIAL'],
    credentials: {
      email: 'admin@vendacore.com',
      password: 'password123',
    },
  },
  {
    slug: 'smarty',
    name: 'Smarty Hardware',
    tagline: 'Loja, checkout e painel de balcão',
    description:
      'E-commerce de peças de PC com CEP, pagamentos fictícios e venda no balcão.',
    stack: 'Laravel 11 · Vue 3 · MySQL',
    url: 'https://smarty-hardware.vercel.app/',
    github: 'https://github.com/exkgred/smarty-hardware',
    category: 'comercial',
    packages: ['FULL', 'COMERCIAL'],
    credentials: {
      email: 'admin@marketplace.test',
      password: 'password',
    },
  },
  {
    slug: 'kanban',
    name: 'Kanban Board',
    tagline: 'Sprints, tags e apontamento de horas',
    description:
      'Quadro em tempo real com WebSocket, Play/Pause e feed de atividades.',
    stack: 'NestJS · Next.js · PostgreSQL',
    url: 'https://kanban-pro-delta.vercel.app/',
    github: 'https://github.com/exkgred/kanban-pro',
    category: 'operacao',
    packages: ['FULL', 'OPERACAO'],
    credentials: {
      email: 'demo@kanban.dev',
      password: 'Demo1234!',
    },
  },
  {
    slug: 'discador',
    name: 'Discador Zenvia',
    tagline: 'Fila, click-to-call e power dialer',
    description:
      'Call center com API de Voz da Zenvia, wrap-up e lista Não Me Perturbe.',
    stack: 'NestJS · React · Redis',
    url: 'https://discador-amber.vercel.app/',
    github: 'https://github.com/exkgred/discador',
    category: 'operacao',
    packages: ['FULL', 'OPERACAO'],
    credentials: {
      email: 'agent@discador.dev',
      password: 'password123',
    },
  },
  {
    slug: 'observability',
    name: 'Chat Observability',
    tagline: 'KPIs, ingest e Grafana Loki',
    description:
      'Painel das conversas do chatbot, com logs assíncronos e série de 14 dias.',
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
    description:
      'Visitante conversa em linguagem natural; o log segue depois para o painel.',
    stack: 'Vercel · Cohere Command A',
    url: 'https://chatbot-cohere-theta.vercel.app/',
    github: 'https://github.com/exkgred/chatbot-cohere',
    category: 'plataforma',
    packages: ['FULL', 'COMERCIAL', 'OPERACAO'],
    credentials: null,
  },
];

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
    description: 'ERP e loja para quem vende e fatura.',
    appSlugs: SUITE_APPS.filter((app) =>
      app.packages.includes('COMERCIAL'),
    ).map((app) => app.slug),
  },
  {
    slug: 'OPERACAO',
    name: 'Operação',
    description: 'Discador e Kanban para o time que executa.',
    appSlugs: SUITE_APPS.filter((app) => app.packages.includes('OPERACAO')).map(
      (app) => app.slug,
    ),
  },
];

export function findSuiteApp(slug: string): SuiteApp | undefined {
  return SUITE_APPS.find((app) => app.slug === slug);
}

export function findSuitePackage(slug: PackageSlug): SuitePackage {
  const pack = SUITE_PACKAGES.find((item) => item.slug === slug);
  if (!pack) {
    return SUITE_PACKAGES[0];
  }
  return pack;
}

export function seesAllApps(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'RECRUITER';
}

export function isAppEntitled(user: User, slug: string): boolean {
  if (seesAllApps(user.role)) {
    return Boolean(findSuiteApp(slug));
  }
  const app = findSuiteApp(slug);
  if (!app) {
    return false;
  }
  return app.packages.includes(user.packageSlug);
}
