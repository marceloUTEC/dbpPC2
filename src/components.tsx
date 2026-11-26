import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type IconName = 'campus' | 'grid' | 'ticket' | 'logout' | 'pin' | 'floor' | 'check' | 'plus' | 'info'

const paths: Record<IconName, ReactNode> = {
  campus: <><path d="m3 9 9-5 9 5M5 10v10h14V10M9 20v-6h6v6M2 20h20" /><path d="M9 9h.01M15 9h.01" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  ticket: <><path d="M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6V4Z" /><path d="M12 7v2m0 3v1m0 3v1" /></>,
  logout: <><path d="M9 4H4v16h5m6-12 4 4-4 4m-7-4h11" /></>,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  floor: <path d="M3 20h5v-5h5v-5h5V5h3M3 4v6m0-6h6" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></>,
}

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`shrink-0 ${className || 'h-5 w-5'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" aria-label="AUlaSoporte, inicio" className={`inline-flex items-center gap-3 ${light ? 'text-white' : 'text-forest'}`}>
    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${light ? 'bg-white/15' : 'bg-forest text-white'}`}><Icon name="campus" className="h-6 w-6" /></span>
    <span className="text-xl font-bold tracking-tight">AUla<span className={light ? 'text-lime-200' : 'text-emerald-700'}>Soporte</span></span>
  </Link>
}

export function Status({ status, ticket = false }: { status: string; ticket?: boolean }) {
  const open = status === 'OPEN'
  const label = open ? (ticket ? 'Abierta' : 'Recibe solicitudes') : status === 'CLOSED' ? (ticket ? 'Cerrada' : 'Atención cerrada') : status
  return <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${open ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-emerald-600' : 'bg-slate-400'}`} />{label}
  </span>
}

export function Loading({ label = 'Cargando información…' }: { label?: string }) {
  return <div role="status" className="flex min-h-52 flex-col items-center justify-center gap-4 text-slate-500">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-700 motion-reduce:animate-none" aria-hidden="true" />
    <p>{label}</p>
  </div>
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
    <div className="flex items-start gap-3 text-red-800"><Icon name="info" /><p className="break-words">{message}</p></div>
    {onRetry && <button type="button" className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100" onClick={onRetry}>Reintentar</button>}
  </div>
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Icon name="ticket" className="h-7 w-7" /></span>
    <h2 className="text-lg font-semibold text-slate-800">{title}</h2><div className="mx-auto mt-2 max-w-md text-slate-500">{children}</div>
  </div>
}

export function Success({ children }: { children: ReactNode }) {
  return <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><Icon name="check" /><p>{children}</p></div>
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  return children ? <p id={id} className="mt-2 text-sm text-red-700" role="alert">{children}</p> : null
}
