import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { SUITE_APPS, SUITE_PACKAGES, findApp, findPackage } from './catalog'
import type {
  AccessLog,
  Envelope,
  PackageSlug,
  PublicUser,
  Workspace,
} from './types'

const STORAGE_KEY = 'porti-access-demo-v1'

interface DemoUser extends PublicUser {
  password: string
}

interface DemoState {
  users: DemoUser[]
  logs: AccessLog[]
  currentUserId: string | null
}

const nowIso = () => new Date().toISOString()

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function seed(): DemoState {
  const createdAt = nowIso()
  const users: DemoUser[] = [
    {
      id: 'user-recruiter',
      name: 'Recrutador',
      email: 'recruiter@porti.dev',
      role: 'RECRUITER',
      packageSlug: 'FULL',
      password: 'password123',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'user-admin',
      name: 'Admin da suíte',
      email: 'admin@porti.dev',
      role: 'ADMIN',
      packageSlug: 'FULL',
      password: 'password123',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'user-comercial',
      name: 'Ana Comercial',
      email: 'comercial@porti.dev',
      role: 'MEMBER',
      packageSlug: 'COMERCIAL',
      password: 'password123',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'user-operacao',
      name: 'Bruno Operação',
      email: 'operacao@porti.dev',
      role: 'MEMBER',
      packageSlug: 'OPERACAO',
      password: 'password123',
      createdAt,
      updatedAt: createdAt,
    },
  ]

  const logs: AccessLog[] = [
    { id: 'log-1', userId: 'user-recruiter', appSlug: 'vendacore', launchedAt: hoursAgo(2), userName: 'Recrutador', userEmail: 'recruiter@porti.dev' },
    { id: 'log-2', userId: 'user-recruiter', appSlug: 'discador', launchedAt: hoursAgo(5), userName: 'Recrutador', userEmail: 'recruiter@porti.dev' },
    { id: 'log-3', userId: 'user-comercial', appSlug: 'smarty', launchedAt: hoursAgo(8), userName: 'Ana Comercial', userEmail: 'comercial@porti.dev' },
    { id: 'log-4', userId: 'user-comercial', appSlug: 'vendacore', launchedAt: hoursAgo(26), userName: 'Ana Comercial', userEmail: 'comercial@porti.dev' },
    { id: 'log-5', userId: 'user-operacao', appSlug: 'kanban', launchedAt: hoursAgo(3), userName: 'Bruno Operação', userEmail: 'operacao@porti.dev' },
    { id: 'log-6', userId: 'user-operacao', appSlug: 'discador', launchedAt: hoursAgo(12), userName: 'Bruno Operação', userEmail: 'operacao@porti.dev' },
    { id: 'log-7', userId: 'user-admin', appSlug: 'observability', launchedAt: hoursAgo(30), userName: 'Admin da suíte', userEmail: 'admin@porti.dev' },
  ]

  return { users, logs, currentUserId: null }
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoState
  } catch {
    /* seed */
  }
  const state = seed()
  save(state)
  return state
}

function save(state: DemoState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function ok<T>(data: T, extra: Envelope<T>['meta'] = {}): Envelope<T> {
  return {
    success: true,
    data,
    meta: { timestamp: nowIso(), requestId: uid('req'), ...extra } as Envelope<T>['meta'],
  }
}

function fail(status: number, message: string, code: string) {
  const error = Object.assign(new Error(message), {
    response: {
      status,
      data: {
        success: false,
        error: { code, message },
        meta: { timestamp: nowIso(), requestId: uid('req') },
      },
    },
  })
  return Promise.reject(error)
}

function publicUser(user: DemoUser): PublicUser {
  const { password: _password, ...rest } = user
  return rest
}

function entitled(user: DemoUser, slug: string): boolean {
  if (user.role === 'ADMIN' || user.role === 'RECRUITER') {
    return Boolean(findApp(slug))
  }
  const app = findApp(slug)
  return Boolean(app?.packages.includes(user.packageSlug))
}

function workspaceOf(user: DemoUser): Workspace {
  return {
    user: publicUser(user),
    package: findPackage(user.packageSlug),
    packages: SUITE_PACKAGES,
    apps: SUITE_APPS.map((app) => ({ ...app, entitled: entitled(user, app.slug) })),
  }
}

function current(state: DemoState): DemoUser | undefined {
  return state.users.find((user) => user.id === state.currentUserId)
}

function bearer(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers.Authorization
  const value = typeof header === 'string' ? header : undefined
  if (!value?.startsWith('Bearer ')) return null
  return value.slice(7)
}

export const demoAdapter: AxiosAdapter = async (config) => {
  const state = load()
  const method = (config.method ?? 'get').toLowerCase()
  const url = (config.url ?? '').replace(config.baseURL ?? '', '')
  const path = url.split('?')[0]
  const token = bearer(config)
  if (token) {
    const owner = state.users.find((user) => user.id === token)
    if (owner) state.currentUserId = owner.id
  }

  const json = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {}

  const respond = (payload: unknown, status = 200) => ({
    data: payload,
    status,
    statusText: 'OK',
    headers: {},
    config,
  })

  if (method === 'post' && path.endsWith('/auth/login')) {
    const user = state.users.find((item) => item.email === json.email && item.password === json.password)
    if (!user) return fail(401, 'Credenciais inválidas', 'UNAUTHORIZED')
    state.currentUserId = user.id
    save(state)
    return respond(
      ok({
        user: publicUser(user),
        tokens: { accessToken: user.id, refreshToken: `refresh-${user.id}` },
      }),
    )
  }

  if (method === 'post' && path.endsWith('/auth/refresh')) {
    const refresh = String(json.refreshToken ?? '')
    const userId = refresh.replace('refresh-', '')
    const user = state.users.find((item) => item.id === userId)
    if (!user) return fail(401, 'Refresh token inválido', 'UNAUTHORIZED')
    return respond(ok({ accessToken: user.id, refreshToken: `refresh-${user.id}` }))
  }

  if (method === 'post' && path.endsWith('/auth/logout')) {
    state.currentUserId = null
    save(state)
    return respond(ok({ ok: true }))
  }

  const actor = current(state)
  if (!actor) return fail(401, 'Unauthorized', 'UNAUTHORIZED')

  if (method === 'get' && path.endsWith('/auth/me')) {
    return respond(ok(publicUser(actor)))
  }

  if (method === 'get' && path.endsWith('/workspace')) {
    return respond(ok(workspaceOf(actor)))
  }

  const launchMatch = path.match(/\/apps\/([^/]+)\/launch$/)
  if (method === 'post' && launchMatch) {
    const slug = launchMatch[1]
    const app = findApp(slug)
    if (!app) return fail(404, 'Sistema não encontrado no catálogo', 'RESOURCE_NOT_FOUND')
    if (!entitled(actor, app.slug)) {
      return fail(403, `O pacote ${actor.packageSlug} não inclui ${app.name}`, 'FORBIDDEN')
    }
    const log: AccessLog = {
      id: uid('log'),
      userId: actor.id,
      appSlug: app.slug,
      launchedAt: nowIso(),
      userName: actor.name,
      userEmail: actor.email,
    }
    state.logs.unshift(log)
    save(state)
    return respond(ok({ app, url: app.url, credentials: app.credentials, launchedAt: log.launchedAt }))
  }

  if (method === 'get' && path.includes('/audit')) {
    const params = new URLSearchParams(url.split('?')[1] ?? '')
    const page = Math.max(1, Number(params.get('page') ?? 1))
    const perPage = Math.min(50, Math.max(1, Number(params.get('perPage') ?? 20)))
    const scoped = actor.role === 'MEMBER' ? state.logs.filter((log) => log.userId === actor.id) : state.logs
    const start = (page - 1) * perPage
    const items = scoped.slice(start, start + perPage)
    const lastPage = Math.max(1, Math.ceil(scoped.length / perPage) || 1)
    return respond(ok(items, { page, perPage, total: scoped.length, lastPage }))
  }

  if (method === 'get' && path.endsWith('/users')) {
    if (actor.role === 'MEMBER') return fail(403, 'Sem permissão para listar pessoas', 'FORBIDDEN')
    return respond(ok(state.users.map(publicUser)))
  }

  const packageMatch = path.match(/\/users\/([^/]+)\/package$/)
  if (method === 'patch' && packageMatch) {
    if (actor.role !== 'ADMIN') return fail(403, 'Apenas administradores alteram pacotes', 'FORBIDDEN')
    const target = state.users.find((item) => item.id === packageMatch[1])
    if (!target) return fail(404, 'User not found', 'RESOURCE_NOT_FOUND')
    target.packageSlug = json.packageSlug as PackageSlug
    target.updatedAt = nowIso()
    save(state)
    return respond(ok(publicUser(target)))
  }

  if (method === 'get' && path.endsWith('/health')) {
    return respond(ok({ status: 'ok' }))
  }

  return fail(404, `Rota demo não mapeada: ${method.toUpperCase()} ${path}`, 'RESOURCE_NOT_FOUND')
}
