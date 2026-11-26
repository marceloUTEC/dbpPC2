import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, apiError } from '../api'
import { EmptyState, ErrorPanel, Icon, Loading, Status, Success } from '../components'
import type { Ticket } from '../types'
import { useQuery } from '../useQuery'

export function MyTickets() {
  const fetcher = useCallback((signal: AbortSignal) => api.tickets(signal), [])
  const { data, loading, error, retry } = useQuery(fetcher)
  const [closing, setClosing] = useState<number | null>(null)
  const closeLock = useRef(false)
  const [pending, setPending] = useState<Ticket | null>(null)
  const [closeError, setCloseError] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [updated, setUpdated] = useState<Record<number, Ticket>>({})

  async function close(ticket: Ticket) {
    if (closeLock.current) return
    closeLock.current = true
    setClosing(ticket.id)
    setCloseError('')
    setConfirmation('')
    try {
      const result = await api.closeTicket(ticket.id)
      setUpdated((previous) => ({ ...previous, [result.id]: result }))
      setConfirmation(`La solicitud #${result.id} se cerró correctamente.`)
      setPending(null)
      retry()
    } catch (reason) {
      setCloseError(apiError(reason))
    } finally {
      closeLock.current = false
      setClosing(null)
    }
  }

  return <>
    <p className="eyebrow">SEGUIMIENTO PERSONAL</p>
    <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight text-slate-900">Mis solicitudes</h1><p className="mt-3 text-slate-500">Consulta tus reportes y ciérralos cuando ya estén resueltos.</p></div><Link className="btn-primary inline-flex items-center gap-2" to="/dashboard"><Icon name="plus" />Crear una solicitud</Link></div>
    <div className="mb-6 space-y-3">{confirmation && <Success>{confirmation}</Success>}{closeError && <ErrorPanel message={closeError} />}</div>
    <section aria-label="Solicitudes enviadas" aria-busy={loading}>
      {loading ? <Loading label="Consultando tus solicitudes…" /> : error ? <ErrorPanel message={error} onRetry={retry} /> : data?.length === 0 ? <EmptyState title="Lista vacía"><p>Aún no tienes solicitudes. Cuando reportes un problema en un espacio, podrás seguirlo desde aquí.</p><Link to="/dashboard" className="mt-5 inline-flex font-semibold text-emerald-800 underline underline-offset-4">Explorar espacios</Link></EmptyState> : <div className="space-y-4">
        {data?.map((original) => {
          const ticket = updated[original.id] ?? original
          return <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-sm text-slate-500">Solicitud #{ticket.id}</p><Link to={`/locations/${ticket.resourceId}`} className="break-words text-lg font-semibold text-slate-900 hover:text-emerald-800 hover:underline">{ticket.resourceName}</Link></div><Status status={ticket.status} ticket /></div>
            <dl className="mt-4"><dt className="text-sm font-medium text-slate-500">Descripción del problema</dt><dd className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-slate-600">{ticket.description}</dd></dl>
            {ticket.status === 'OPEN' && <div className="mt-5 border-t border-slate-100 pt-5">
              {pending?.id === ticket.id ? <div><p className="mb-3 text-sm text-slate-600">¿El problema está resuelto? La solicitud quedará cerrada.</p><div className="flex flex-wrap gap-2"><button type="button" className="btn-primary" disabled={closing !== null} onClick={() => close(ticket)}>{closing === ticket.id ? 'Cerrando…' : 'Confirmar cierre'}</button><button type="button" className="btn-secondary" disabled={closing !== null} onClick={() => setPending(null)}>Cancelar</button></div></div> : <button className="btn-secondary" type="button" disabled={closing !== null} onClick={() => { setPending(ticket); setCloseError('') }}>Cerrar solicitud</button>}
            </div>}
          </article>
        })}
      </div>}
    </section>
  </>
}
