import type { AppSlug, PackageSlug, UserRole } from './types'

export const PACKAGE_LABEL: Record<PackageSlug, string> = {
  FULL: 'Full',
  COMERCIAL: 'Comercial',
  OPERACAO: 'Operação',
}

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  RECRUITER: 'Recrutador',
  MEMBER: 'Membro',
}

export const CATEGORY_LABEL = {
  comercial: 'Ala comercial',
  operacao: 'Ala operação',
  plataforma: 'Ala plataforma',
} as const

export const APP_TINT: Record<AppSlug, string> = {
  vendacore: 'bg-blue-500/15 text-blue-300 ring-blue-400/20',
  smarty: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
  kanban: 'bg-violet-500/15 text-violet-300 ring-violet-400/20',
  discador: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/20',
  observability: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20',
  chat: 'bg-sky-500/15 text-sky-300 ring-sky-400/20',
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

export function timeAgo(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(1, Math.round(delta / 60_000))
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.round(hours / 24)
  return `há ${days} d`
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}
