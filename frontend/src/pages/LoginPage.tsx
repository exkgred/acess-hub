import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { api, unwrap } from '@/lib/api'
import type { Envelope, PublicUser } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

const PERSONAS = [
  { email: 'recruiter@atrio.dev', label: 'Recrutador', hint: 'vê a suíte inteira' },
  { email: 'comercial@atrio.dev', label: 'Comercial', hint: 'ERP + loja' },
  { email: 'operacao@atrio.dev', label: 'Operação', hint: 'Discador + Kanban' },
  { email: 'admin@atrio.dev', label: 'Admin', hint: 'troca pacotes' },
] as const

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('recruiter@atrio.dev')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      const { data } = await api.post<
        Envelope<{ user: PublicUser; tokens: { accessToken: string; refreshToken: string } }>
      >('/auth/login', { email, password })
      const session = unwrap(data)
      setSession(session.user, session.tokens.accessToken, session.tokens.refreshToken)
      navigate('/')
    } catch {
      setError('Credenciais inválidas')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-ink-900/80 p-8 shadow-glow backdrop-blur"
      >
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
            <LayoutGrid size={22} />
          </div>
          <h1 className="text-2xl font-bold text-ink-300">Átrio</h1>
          <p className="mt-1 text-sm text-ink-500">
            O hall da suíte. Um crachá, as portas que o pacote libera.
          </p>
        </div>
        <label className="block text-sm font-medium text-ink-500">
          E-mail
          <input
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-ink-300 outline-none focus:border-accent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-ink-500">
          Senha
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-ink-300 outline-none focus:border-accent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-accent py-2.5 font-medium text-white hover:bg-accent-hover"
        >
          Entrar
        </button>
        <div className="grid grid-cols-2 gap-2">
          {PERSONAS.map((persona) => (
            <button
              key={persona.email}
              type="button"
              className={`rounded-lg px-2 py-2 text-left text-xs ${
                email === persona.email ? 'bg-accent/15 text-accent' : 'bg-ink-800 text-ink-300'
              }`}
              onClick={() => setEmail(persona.email)}
            >
              <span className="block font-medium">{persona.label}</span>
              <span className="text-[11px] text-ink-500">{persona.hint}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-ink-500">senha: password123</p>
      </form>
    </div>
  )
}
