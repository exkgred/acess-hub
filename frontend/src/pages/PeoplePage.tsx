import { useEffect, useState } from 'react'
import { api, unwrap } from '@/lib/api'
import { SUITE_PACKAGES } from '@/lib/catalog'
import type { Envelope, PackageSlug, PublicUser } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

export default function PeoplePage() {
  const actor = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<PublicUser[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    const { data } = await api.get<Envelope<PublicUser[]>>('/users')
    setUsers(unwrap(data))
  }

  useEffect(() => {
    let active = true
    load()
      .catch(() => {
        if (active) setError('Sem permissão para ver pessoas')
      })
    return () => {
      active = false
    }
  }, [])

  async function changePackage(userId: string, packageSlug: PackageSlug) {
    setSaving(userId)
    setError('')
    try {
      const { data } = await api.patch<Envelope<PublicUser>>(`/users/${userId}/package`, {
        packageSlug,
      })
      const updated = unwrap(data)
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)))
    } catch {
      setError('Só o admin troca o pacote')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink-300">Pessoas e pacotes</h1>
        <p className="mt-1 text-sm text-ink-500">
          O pacote é a licença da suíte. Admin pode mover alguém de Comercial para Operação e o launchpad muda.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-ink-300">{user.name}</p>
              <p className="text-xs text-ink-500">
                {user.email} · {user.role}
              </p>
            </div>
            <label className="text-xs text-ink-500">
              Pacote
              <select
                className="ml-2 rounded-lg border border-ink-700 bg-ink-800 px-2 py-1 text-sm text-ink-300"
                value={user.packageSlug}
                disabled={actor?.role !== 'ADMIN' || saving === user.id}
                onChange={(event) =>
                  void changePackage(user.id, event.target.value as PackageSlug)
                }
              >
                {SUITE_PACKAGES.map((pack) => (
                  <option key={pack.slug} value={pack.slug}>
                    {pack.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
