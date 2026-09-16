import { useEffect, useState } from 'react'
import { appLabel } from '@/lib/catalog'
import { api, unwrap } from '@/lib/api'
import type { AccessLog, Envelope } from '@/lib/types'

export default function AuditPage() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

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
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink-300">Auditoria</h1>
        <p className="mt-1 text-sm text-ink-500">
          Quem abriu qual sistema. Recrutador e admin veem a suíte; member vê só os próprios lançamentos.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-xs text-ink-500">{total} eventos</p>
      <div className="overflow-hidden rounded-2xl border border-white/10">
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
                  {new Date(log.launchedAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div>{log.userName ?? log.userId}</div>
                  <div className="text-xs text-ink-500">{log.userEmail}</div>
                </td>
                <td className="px-4 py-3 text-ink-300">{appLabel(log.appSlug)}</td>
              </tr>
            ))}
            {logs.length === 0 && !error && (
              <tr>
                <td className="px-4 py-6 text-ink-500" colSpan={3}>
                  Nenhum acesso ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
