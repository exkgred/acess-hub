import { useEffect, useState } from 'react'
import {
  Activity,
  ExternalLink,
  Github,
  Columns3,
  LayoutGrid,
  Lock,
  MessageCircle,
  Phone,
  ShoppingBag,
} from 'lucide-react'
import { api, unwrap } from '@/lib/api'
import type { CatalogApp, Envelope, LaunchResult, Workspace } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

const ICONS = {
  vendacore: LayoutGrid,
  smarty: ShoppingBag,
  kanban: Columns3,
  discador: Phone,
  observability: Activity,
  chat: MessageCircle,
} as const

export default function HubPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState('')
  const [launching, setLaunching] = useState<string | null>(null)
  const [modal, setModal] = useState<LaunchResult | null>(null)
  const [locked, setLocked] = useState<CatalogApp | null>(null)

  useEffect(() => {
    let active = true
    api
      .get<Envelope<Workspace>>('/workspace')
      .then(({ data }) => {
        if (!active) return
        const workspaceData = unwrap(data)
        setWorkspace(workspaceData)
        setUser(workspaceData.user)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o launchpad')
      })
    return () => {
      active = false
    }
  }, [setUser])

  async function openApp(app: CatalogApp) {
    if (!app.entitled) {
      setLocked(app)
      return
    }
    setLaunching(app.slug)
    setError('')
    try {
      const { data } = await api.post<Envelope<LaunchResult>>(`/apps/${app.slug}/launch`)
      setModal(unwrap(data))
    } catch {
      setError(`Sem permissão para abrir ${app.name}`)
    } finally {
      setLaunching(null)
    }
  }

  if (!workspace) {
    return <p className="text-sm text-ink-500">{error || 'Carregando suíte…'}</p>
  }

  const unlocked = workspace.apps.filter((app) => app.entitled).length

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-ink-900/60 p-6 shadow-glow">
        <p className="text-xs uppercase tracking-wide text-accent">Pacote {workspace.package.name}</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-300">Sistemas disponíveis</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">{workspace.package.description}</p>
        <p className="mt-3 text-xs text-ink-500">
          {unlocked} de {workspace.apps.length} módulos liberados para {workspace.user.name}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {workspace.packages.map((pack) => (
            <span
              key={pack.slug}
              className={`rounded-full px-3 py-1 text-xs ${
                pack.slug === workspace.package.slug
                  ? 'bg-accent/15 text-accent'
                  : 'bg-ink-800 text-ink-500'
              }`}
            >
              {pack.name}
            </span>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workspace.apps.map((app) => {
          const Icon = ICONS[app.slug]
          return (
            <button
              key={app.slug}
              type="button"
              onClick={() => void openApp(app)}
              className={`group rounded-2xl border p-5 text-left transition ${
                app.entitled
                  ? 'border-white/10 bg-ink-900/70 hover:border-accent/40 hover:bg-ink-800'
                  : 'border-white/5 bg-ink-900/30 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    app.entitled ? 'bg-accent/15 text-accent' : 'bg-ink-800 text-ink-500'
                  }`}
                >
                  <Icon size={18} />
                </span>
                {app.entitled ? (
                  <ExternalLink size={16} className="text-ink-500 group-hover:text-accent" />
                ) : (
                  <Lock size={16} className="text-ink-500" />
                )}
              </div>
              <h2 className="mt-4 font-semibold text-ink-300">{app.name}</h2>
              <p className="mt-1 text-sm text-ink-500">{app.tagline}</p>
              <p className="mt-3 text-xs text-ink-500">{app.stack}</p>
              <span className="mt-4 inline-block text-xs font-medium text-accent">
                {launching === app.slug
                  ? 'Abrindo…'
                  : app.entitled
                    ? 'Abrir sistema'
                    : `Fora do pacote ${workspace.package.name}`}
              </span>
            </button>
          )
        })}
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-glow">
            <h3 className="text-lg font-semibold text-ink-300">{modal.app.name}</h3>
            <p className="mt-1 text-sm text-ink-500">{modal.app.description}</p>
            {modal.credentials && (
              <div className="mt-4 rounded-lg bg-ink-800 p-3 text-sm">
                <p className="text-ink-500">Login da demo</p>
                <p className="mt-1 font-mono text-ink-300">{modal.credentials.email}</p>
                <p className="font-mono text-ink-300">{modal.credentials.password}</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={modal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                <ExternalLink size={14} /> Abrir demo
              </a>
              <a
                href={modal.app.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-ink-800 px-4 py-2 text-sm text-ink-300"
              >
                <Github size={14} /> Código
              </a>
              <button
                type="button"
                className="ml-auto text-sm text-ink-500"
                onClick={() => setModal(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {locked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6">
            <h3 className="text-lg font-semibold text-ink-300">{locked.name} não está no pacote</h3>
            <p className="mt-2 text-sm text-ink-500">
              O pacote {workspace.package.name} libera {workspace.package.appSlugs.length} módulos.
              Entre como Recrutador ou Full para abrir {locked.name}.
            </p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-ink-800 px-4 py-2 text-sm"
              onClick={() => setLocked(null)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
