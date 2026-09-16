import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoorOpen } from 'lucide-react'
import { api, unwrap } from '@/lib/api'
import type { Envelope, PublicUser } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

const PERSONAS = [
  { email: 'recruiter@atrio.dev', label: 'Recrutador', hint: 'Todas as portas' },
  { email: 'comercial@atrio.dev', label: 'Comercial', hint: 'ERP e loja' },
  { email: 'operacao@atrio.dev', label: 'Operação', hint: 'Discador e Kanban' },
  { email: 'admin@atrio.dev', label: 'Admin', hint: 'Troca pacotes' },
] as const

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('recruiter@atrio.dev')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post<
        Envelope<{ user: PublicUser; tokens: { accessToken: string; refreshToken: string } }>
      >('/auth/login', { email, password })
      const session = unwrap(data)
      setSession(session.user, session.tokens.accessToken, session.tokens.refreshToken)
      navigate('/')
    } catch {
      setError('Credenciais inválidas')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_0.9fr]">
      <aside className="atrio-grid relative hidden flex-col justify-between overflow-hidden border-r border-white/10 px-12 py-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,142,247,0.18),transparent_42%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-500">
            <DoorOpen size={14} className="text-accent" />
            Hall da suíte
          </div>
          <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-tight text-ink-300">
            Um crachá.
            <span className="block text-accent">As portas que o pacote libera.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
            O Átrio reúne VendaCore, Smarty, Kanban, Discador, observabilidade e o chat.
            Comercial vê vendas. Operação vê execução. Recrutador vê a suíte inteira.
          </p>
        </div>
        <ul className="relative grid gap-3 text-sm text-ink-500">
          <li className="rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">Full — todas as alas</li>
          <li className="rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">Comercial — ERP e loja</li>
          <li className="rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">Operação — discador e kanban</li>
        </ul>
      </aside>

      <div className="flex items-center justify-center px-4 py-10">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-ink-900/80 p-8 shadow-glow backdrop-blur"
        >
          <div className="text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white lg:mx-0">
              <DoorOpen size={22} />
            </div>
            <h2 className="text-2xl font-semibold text-ink-300">Entrar no Átrio</h2>
            <p className="mt-1 text-sm text-ink-500">Escolha um crachá de demo. A senha já vem preenchida.</p>
          </div>
          <label className="block text-sm font-medium text-ink-500">
            E-mail
            <input
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-sm text-ink-300 outline-none focus:border-accent"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-ink-500">
            Senha
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2.5 text-sm text-ink-300 outline-none focus:border-accent"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-accent py-2.5 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? 'Abrindo o hall…' : 'Entrar'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            {PERSONAS.map((persona) => (
              <button
                key={persona.email}
                type="button"
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  email === persona.email
                    ? 'border-accent/40 bg-accent/15 text-accent'
                    : 'border-white/5 bg-ink-800 text-ink-300 hover:border-white/10'
                }`}
                onClick={() => setEmail(persona.email)}
              >
                <span className="block text-sm font-medium">{persona.label}</span>
                <span className="text-[11px] text-ink-500">{persona.hint}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-ink-500">senha: password123</p>
        </form>
      </div>
    </div>
  )
}
