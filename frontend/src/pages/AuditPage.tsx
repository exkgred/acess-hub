import { useEffect, useState } from 'react'
import { appLabel } from '@/lib/catalog'
import { timeAgo } from '@/lib/brand'
import { api, unwrap } from '@/lib/api'
import type { AccessLog, Envelope } from '@/lib/types'

export default function AuditPage() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api
      .get<Envelope<AccessLog[]>>('/audit', { params: { page: 1, perPage: 20 } })
      .then(({ data }) => {
        if (!active) return
        setLogs(unwrap(data))
        setTotal(data.meta?.total ?? unwrap(data).length)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar a auditoria')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const uniquePeople = new Set(logs.map((log) => log.userId)).size
  const uniqueApps = new Set(logs.map((log) => log.appSlug)).size

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-300">Auditoria</h1>
        <p className="mt-1 text-sm text-ink-500">
          Quem atravessou qual porta. Recrutador e admin veem o hall; member vê só os próprios passos.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Eventos', value: total },
          { label: 'Pessoas', value: uniquePeople },
          { label: 'Sistemas', value: uniqueApps },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/10 bg-ink-900/50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-ink-500">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink-300">{loading ? '—' : kpi.value}</p>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Pessoa</th>
                <th className="px-4 py-3 font-medium">Sistema</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-white/5 bg-ink-900/40">
                  <td className="px-4 py-3 text-ink-500">
                    <div>{timeAgo(log.launchedAt)}</div>
                    <div className="text-[11px]">{new Date(log.launchedAt).toLocaleString('pt-BR')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink-300">{log.userName ?? log.userId}</div>
                    <div className="text-xs text-ink-500">{log.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-300">{appLabel(log.appSlug)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-white/5 md:hidden">
          {logs.map((log) => (
            <article key={log.id} className="bg-ink-900/40 px-4 py-3">
              <p className="font-medium text-ink-300">{appLabel(log.appSlug)}</p>
              <p className="text-xs text-ink-500">{log.userName}</p>
              <p className="mt-1 text-xs text-ink-500">{timeAgo(log.launchedAt)}</p>
            </article>
          ))}
        </div>
        {logs.length === 0 && !error && !loading && (
          <p className="px-4 py-8 text-center text-sm text-ink-500">Nenhuma porta aberta ainda.</p>
        )}
      </div>
    </div>
  )
}
