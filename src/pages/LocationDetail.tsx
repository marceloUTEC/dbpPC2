import { useCallback, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api, apiError } from '../api'
import { ErrorPanel, FieldError, Icon, Loading, Status, Success } from '../components'
import { useQuery } from '../useQuery'

export function LocationDetail() {
  const { id = '' } = useParams()
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return <>
    <Link to="/dashboard" className="mb-7 inline-flex text-sm font-semibold text-emerald-800 underline underline-offset-4">Volver a espacios del campus</Link>
    <ErrorPanel message="El identificador del espacio no es válido." />
  </>
  return <LocationContent key={id} id={id} />
}

function LocationContent({ id }: { id: string }) {
  const route = useLocation()
  const fromPage = Number(route.state?.fromPage)
  const backTo = Number.isSafeInteger(fromPage) && fromPage > 1 ? `/dashboard?page=${fromPage}` : '/dashboard'
  const fetcher = useCallback((signal: AbortSignal) => api.location(id, signal), [id])
  const { data, loading, error, retry } = useQuery(fetcher)
  const [description, setDescription] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const [confirmation, setConfirmation] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitLock.current || loading || !data || data.status === 'CLOSED') return
    const trimmed = description.trim()
    setSubmitError('')
    setConfirmation('')
    if (trimmed.length < 10 || trimmed.length > 200) {
      setFieldError('Describe el problema con entre 10 y 200 caracteres, sin contar espacios al inicio o al final.')
      document.getElementById('description')?.focus()
      return
    }
    setFieldError('')
    submitLock.current = true
    setSubmitting(true)
    try {
      const ticket = await api.createTicket(id, trimmed)
      setDescription('')
      setConfirmation(`Solicitud #${ticket.id} enviada. Puedes seguirla en Mis solicitudes.`)
      retry()
    } catch (reason) {
      if (isAxiosError<{ code?: string }>(reason) && (reason.response?.status === 409 || reason.response?.data?.code?.toUpperCase() === 'LOCATION_CLOSED')) {
        setSubmitError('El espacio está cerrado y no admite solicitudes. Se ha solicitado el detalle actualizado.')
        retry()
      } else {
        setSubmitError(apiError(reason))
      }
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return <>
    <Link to={backTo} className="mb-7 inline-flex rounded text-sm font-semibold text-emerald-800 underline decoration-emerald-200 underline-offset-4">Volver a espacios del campus</Link>
    {confirmation && <div className="mb-6"><Success>{confirmation}</Success></div>}
    {submitError && <div className="mb-6"><ErrorPanel message={submitError} /></div>}
    {loading ? <Loading label="Actualizando el detalle del espacio…" /> : error ? <ErrorPanel message={error} onRetry={retry} /> : data && <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="detail-banner relative flex h-44 items-center justify-center overflow-hidden bg-forest"><div className="hero-lines" aria-hidden="true" /><Icon name="campus" className="relative h-20 w-20 text-lime-200" /></div>
        <div className="p-6 sm:p-8">
          <Status status={data.status} />
          <h1 className="mt-5 break-words text-3xl font-semibold tracking-tight text-slate-900">{data.name}</h1>
          <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed text-slate-500">{data.description || 'Este espacio todavía no tiene una descripción.'}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <div><dt className="mb-2 flex items-center gap-2 text-sm text-slate-500"><Icon name="pin" className="h-4 w-4" />Edificio</dt><dd className="break-words font-medium text-slate-800">{data.building}</dd></div>
            <div><dt className="mb-2 flex items-center gap-2 text-sm text-slate-500"><Icon name="floor" className="h-4 w-4" />Piso</dt><dd className="font-medium text-slate-800">{data.floor}</dd></div>
          </dl>
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-labelledby="report-heading">
        <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Icon name="ticket" /></span>
        <h2 id="report-heading" className="text-2xl font-semibold tracking-tight text-slate-900">¿Algo necesita atención?</h2>
        <p className="mb-6 mt-3 leading-relaxed text-slate-500">Cuéntanos qué ocurre en este espacio. El equipo de soporte recibirá tu solicitud.</p>
        {data.status === 'CLOSED' && <div className="mb-5"><ErrorPanel message="Este espacio tiene la atención cerrada y no recibe nuevas solicitudes por ahora." /></div>}
        <form onSubmit={submit} noValidate aria-busy={submitting}>
          <label className="field-label" htmlFor="description">Descripción del problema</label>
          <textarea id="description" name="description" className="input min-h-40 resize-y" rows={5} placeholder="Por ejemplo: la lámpara junto a la puerta no enciende." value={description} onChange={(event) => { setDescription(event.target.value); setFieldError(''); setSubmitError('') }} disabled={submitting || data.status === 'CLOSED'} required aria-invalid={!!fieldError} aria-describedby={`description-help${fieldError ? ' description-error' : ''}`} />
          <div className="mt-2 flex justify-between gap-3 text-sm text-slate-500"><p id="description-help">Entre 10 y 200 caracteres.</p><span className={description.trim().length > 200 ? 'text-red-700' : ''}>{description.trim().length}/200</span></div>
          <FieldError id="description-error">{fieldError}</FieldError>
          <button className="btn-primary mt-6 w-full" type="submit" disabled={submitting || data.status === 'CLOSED'}>{submitting ? 'Enviando solicitud…' : 'Enviar solicitud'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">Consulta tus reportes en <Link to="/my-tickets" className="font-medium text-emerald-800 underline underline-offset-2">Mis solicitudes</Link>.</p>
      </section>
    </div>}
  </>
}
