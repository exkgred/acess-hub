export type UserRole = 'ADMIN' | 'RECRUITER' | 'MEMBER'
export type PackageSlug = 'FULL' | 'COMERCIAL' | 'OPERACAO'
export type AppSlug =
  | 'vendacore'
  | 'smarty'
  | 'kanban'
  | 'discador'
  | 'observability'
  | 'chat'

export interface PublicUser {
  id: string
  name: string
  email: string
  role: UserRole
  packageSlug: PackageSlug
  createdAt?: string
  updatedAt?: string
}

export interface AppCredentials {
  email: string
  password: string
  hint?: string
}

export interface SuiteApp {
  slug: AppSlug
  name: string
  tagline: string
  description: string
  stack: string
  url: string
  github: string
  category: 'comercial' | 'operacao' | 'plataforma'
  packages: PackageSlug[]
  credentials: AppCredentials | null
}

export interface CatalogApp extends SuiteApp {
  entitled: boolean
}

export interface SuitePackage {
  slug: PackageSlug
  name: string
  description: string
  appSlugs: AppSlug[]
}

export interface Workspace {
  user: PublicUser
  package: SuitePackage
  packages: SuitePackage[]
  apps: CatalogApp[]
}

export interface LaunchResult {
  app: SuiteApp
  url: string
  credentials: AppCredentials | null
  launchedAt: string
}

export interface AccessLog {
  id: string
  userId: string
  appSlug: string
  launchedAt: string
  userName?: string
  userEmail?: string
}

export interface Envelope<T> {
  success: boolean
  data: T
  meta?: { page?: number; perPage?: number; total?: number; lastPage?: number }
  error?: { code: string; message: string }
}
