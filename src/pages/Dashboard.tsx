import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { EmptyState, ErrorPanel, Icon, Loading, Status } from '../components'
import { useQuery } from '../useQuery'

export function Dashboard() {
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get('page') || 1)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const fetcher = useCallback((signal: AbortSignal) => api.locations(page, signal), [page])
  const { data, loading, error, retry } = useQuery(fetcher)
  const [lastTotalPages, setLastTotalPages] = useState<number | null>(null)
  const totalPages = data ? Math.max(1, data.totalPages) : lastTotalPages
  const currentPage = data?.page ?? page

  useEffect(() => {
    if (!loading && !error && data) {
      const pages = Math.max(1, data.totalPages)
      setLastTotalPages(pages)
      if (page > pages) setParams({ page: String(pages) }, { replace: true })
    }
  }, [data, loading, error, page, setParams])

  return <>
    <section className="relative overflow-hidden rounded-3xl bg-forest px-6 py-8 text-white sm:px-10 sm:py-10">
      <div className="hero-lines" aria-hidden="true" />
      <div className="relative max-w-xl">
        <p className="text-sm font-semibold tracking-[0.16em] text-lime-200">JUNTOS CUIDAMOS EL CAMPUS</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Mejores espacios.<br />Mejores experiencias.</h1>
        <p className="mt-4 max-w-lg leading-relaxed text-emerald-100/85">Consulta los espacios del campus y cuéntanos qué necesita atención. Tu reporte hace la diferencia.</p>
      </div>
      <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-3xl border border-white/15 bg-white/5 p-7 lg:flex"><Icon name="campus" className="h-24 w-24 text-lime-200" /></div>
    </section>
    <section className="mt-10" aria-labelledby="spaces-heading" aria-busy={loading}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">EXPLORA TU CAMPUS</p><h2 id="spaces-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Espacios del campus</h2><p className="mt-2 text-slate-500">Selecciona un espacio para ver su detalle o crear una solicitud.</p></div>
        {data && !loading && !error && <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">{data.totalItems} {data.totalItems === 1 ? 'espacio' : 'espacios'}</span>}
      </div>
      {loading ? <Loading label="Consultando espacios del campus…" /> : error ? <ErrorPanel message={error} onRetry={retry} /> : data && <>
        {data.items.length === 0 ? <EmptyState title="No hay espacios en esta página"><p>Cuando haya espacios disponibles, los encontrarás aquí.</p></EmptyState> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((location) => <Link key={location.id} to={`/locations/${location.id}`} state={{ fromPage: page }} className="location-card group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/5">
            <div className="mb-6 flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-forest group-hover:bg-emerald-50"><Icon name="campus" className="h-6 w-6" /></span><Status status={location.status} /></div>
            <h3 className="break-words text-xl font-semibold text-slate-900">{location.name}</h3>
            <div className="mb-6 mt-4 space-y-2 text-sm text-slate-500"><p className="flex items-start gap-2"><Icon name="pin" className="h-4 w-4" />{location.building}</p><p className="flex items-center gap-2"><Icon name="floor" className="h-4 w-4" />Piso {location.floor}</p></div>
            <div className="mt-auto border-t border-slate-100 pt-4 text-sm font-semibold text-emerald-800">Ver espacio</div>
          </Link>)}
        </div>}
      </>}
      <nav aria-label="Paginación de espacios" className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:px-6">
        <p className="text-sm text-slate-600" aria-live="polite">Página <strong className="text-slate-900">{currentPage}</strong> de <strong className="text-slate-900">{totalPages ?? '…'}</strong></p>
        <div className="flex gap-2"><button type="button" className="btn-secondary" disabled={loading || !!error || !data || currentPage <= 1} onClick={() => setParams({ page: String(currentPage - 1) })}>Anterior</button><button type="button" className="btn-secondary" disabled={loading || !!error || !data || totalPages === null || currentPage >= totalPages} onClick={() => setParams({ page: String(currentPage + 1) })}>Siguiente</button></div>
      </nav>
    </section>
    <aside className="mt-8 flex items-start gap-3 rounded-xl bg-emerald-50 px-5 py-4 text-sm leading-relaxed text-emerald-900"><Icon name="info" /><p>¿Ya enviaste un reporte? Revisa su estado en <Link to="/my-tickets" className="font-semibold underline underline-offset-2">Mis solicitudes</Link>.</p></aside>
  </>
}
