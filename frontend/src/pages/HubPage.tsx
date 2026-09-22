import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Columns3,
  Copy,
  ExternalLink,
  Github,
  GitMerge,
  LayoutGrid,
  Lock,
  MessageCircle,
  Phone,
  ShoppingBag,
} from 'lucide-react'
import { APP_TINT, CATEGORY_LABEL, PACKAGE_LABEL, copyText } from '@/lib/brand'
import { api, unwrap } from '@/lib/api'
import type { CatalogApp, Envelope, LaunchResult, Workspace } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

const ICONS = {
  vendacore: LayoutGrid,
  nexo: GitMerge,
  smarty: ShoppingBag,
  kanban: Columns3,
  discador: Phone,
  observability: Activity,
  chat: MessageCircle,
} as const

const CATEGORIES = ['comercial', 'operacao', 'plataforma'] as const

export default function HubPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState('')
  const [launching, setLaunching] = useState<string | null>(null)
  const [modal, setModal] = useState<LaunchResult | null>(null)
  const [locked, setLocked] = useState<CatalogApp | null>(null)
  const [copied, setCopied] = useState(false)

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

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setModal(null)
        setLocked(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const grouped = useMemo(() => {
    if (!workspace) return []
    return CATEGORIES.map((category) => ({
      category,
      apps: workspace.apps.filter((app) => app.category === category),
    })).filter((group) => group.apps.length > 0)
  }, [workspace])

  async function openApp(app: CatalogApp) {
    if (!app.entitled) {
      setLocked(app)
      return
    }
    setLaunching(app.slug)
    setError('')
    setCopied(false)
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
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-ink-900/50" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-white/5 bg-ink-900/40" />
          ))}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    )
  }

  const unlocked = workspace.apps.filter((app) => app.entitled).length
  const percent = Math.round((unlocked / workspace.apps.length) * 100)

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 shadow-glow">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Pacote {PACKAGE_LABEL[workspace.package.slug]}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-300">Bom ver você, {workspace.user.name.split(' ')[0]}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
              {workspace.package.description} Clique numa porta para abrir a demo com o login já à mão.
            </p>
          </div>
          <div className="flex min-w-[9rem] flex-col justify-center rounded-2xl border border-white/10 bg-ink-950/50 px-5 py-4">
            <p className="text-2xl font-semibold text-ink-300">{unlocked}/{workspace.apps.length}</p>
            <p className="text-xs text-ink-500">portas abertas</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800">
              <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/5 px-6 py-4 md:px-8">
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

      {grouped.map((group) => (
        <section key={group.category} className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink-500">{CATEGORY_LABEL[group.category]}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.apps.map((app) => {
              const Icon = ICONS[app.slug]
              return (
                <button
                  key={app.slug}
                  type="button"
                  onClick={() => void openApp(app)}
                  className={`group rounded-2xl border p-5 text-left transition ${
                    app.entitled
                      ? 'border-white/10 bg-ink-900/70 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-ink-800 hover:shadow-glow'
                      : 'border-white/5 bg-ink-900/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${APP_TINT[app.slug]}`}>
                      <Icon size={18} />
                    </span>
                    {app.entitled ? (
                      <ExternalLink size={16} className="text-ink-500 group-hover:text-accent" />
                    ) : (
                      <Lock size={16} className="text-ink-500" />
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-ink-300">{app.name}</h3>
                  <p className="mt-1 text-sm text-ink-500">{app.tagline}</p>
                  <p className="mt-3 text-xs text-ink-500">{app.stack}</p>
                  <span className={`mt-4 inline-block text-xs font-medium ${app.entitled ? 'text-accent' : 'text-ink-500'}`}>
                    {launching === app.slug
                      ? 'Abrindo…'
                      : app.entitled
                        ? 'Abrir porta'
                        : `Travada no pacote ${PACKAGE_LABEL[workspace.package.slug]}`}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-glow">
            <p className="text-xs uppercase tracking-wide text-accent">Porta liberada</p>
            <h3 className="mt-1 text-lg font-semibold text-ink-300">{modal.app.name}</h3>
            <p className="mt-1 text-sm text-ink-500">{modal.app.description}</p>
            {modal.credentials && (
              <div className="mt-4 rounded-xl border border-white/5 bg-ink-800 p-3 text-sm">
                <div className="flex items-center justify-between text-ink-500">
                  <span>Login da demo</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-accent"
                    onClick={() => {
                      void copyText(`${modal.credentials?.email} / ${modal.credentials?.password}`).then((ok) => {
                        if (ok) {
                          setCopied(true)
                          window.setTimeout(() => setCopied(false), 1600)
                        }
                      })
                    }}
                  >
                    <Copy size={12} /> {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
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
              <button type="button" className="ml-auto text-sm text-ink-500" onClick={() => setModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {locked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 text-ink-500">
              <Lock size={18} />
            </div>
            <h3 className="text-lg font-semibold text-ink-300">{locked.name} está fora do seu crachá</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              O pacote {PACKAGE_LABEL[workspace.package.slug]} abre {workspace.package.appSlugs.length} portas.
              Entre como Recrutador (Full) para percorrer o hall inteiro.
            </p>
            <button
              type="button"
              className="mt-5 rounded-lg bg-ink-800 px-4 py-2 text-sm text-ink-300"
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
