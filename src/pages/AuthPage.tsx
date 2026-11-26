import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api, apiError } from '../api'
import { useAuth } from '../auth'
import { Brand, ErrorPanel, FieldError, Icon, Success } from '../components'

interface Fields {
  name: string
  email: string
  password: string
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const { token, expired, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState<Fields>({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  if (token) return <Navigate to="/dashboard" replace />

  function update(field: keyof Fields, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitLock.current) return
    const next: Partial<Fields> = {}
    const name = values.name.trim()
    const email = values.email.trim()
    if (register && (!name || name.length > 100)) next.name = 'Escribe tu nombre, de 1 a 100 caracteres.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Escribe un correo electrónico válido.'
    if (register && (values.password.length < 8 || values.password.length > 72)) next.password = 'La contraseña debe tener entre 8 y 72 caracteres.'
    if (!register && !values.password) next.password = 'Escribe tu contraseña.'
    setErrors(next)
    setError('')
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus()
      return
    }
    submitLock.current = true
    setSubmitting(true)
    try {
      if (register) {
        await api.register(name, email, values.password)
        navigate('/login', { replace: true, state: { registered: true } })
      } else {
        const result = await api.login(email, values.password)
        if (!result.token) throw new Error('No se recibió un token.')
        signIn(result.token)
        navigate('/dashboard', { replace: true })
      }
    } catch (reason) {
      setError(apiError(reason))
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="auth-aside relative hidden overflow-hidden bg-forest px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
      <Brand light />
      <div className="relative z-10 my-auto max-w-lg py-16">
        <span className="mb-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-emerald-100">Cuidamos nuestros espacios</span>
        <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">Tu campus.<br />Tu comunidad.<br /><span className="text-lime-200">Tu voz.</span></h1>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-emerald-100/85">Conecta con el equipo de soporte y ayúdanos a crear mejores espacios para todos.</p>
        <div className="campus-art mt-12" aria-hidden="true"><div className="campus-building building-one" /><div className="campus-building building-two" /><div className="campus-building building-three" /><div className="campus-ground" /><div className="campus-tree tree-one" /><div className="campus-tree tree-two" /></div>
      </div>
      <p className="relative z-10 text-sm text-emerald-100/70">AUlaSoporte · Hecho para la vida universitaria</p>
    </aside>
    <main className="flex flex-col bg-white px-6 py-8 sm:px-12">
      <div className="lg:hidden"><Brand /></div>
      <div className="mx-auto my-auto w-full max-w-md py-12">
        <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"><Icon name={register ? 'plus' : 'campus'} className="h-6 w-6" /></span>
        <p className="eyebrow">PORTAL DE SOPORTE</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{register ? 'Sé parte del cambio.' : 'Qué bueno verte.'}</h2>
        <p className="mb-8 mt-3 leading-relaxed text-slate-500">{register ? 'Crea tu cuenta para reportar problemas y dar seguimiento a tus solicitudes.' : 'Ingresa a tu cuenta para cuidar los espacios que compartimos.'}</p>
        <div className="mb-5 space-y-3">
          {!register && location.state?.registered && <Success>Tu cuenta se creó correctamente. Ya puedes iniciar sesión.</Success>}
          {!register && expired && <ErrorPanel message="Tu sesión ha vencido. Inicia sesión nuevamente." />}
          {error && <ErrorPanel message={error} />}
        </div>
        <form onSubmit={submit} noValidate className="space-y-5" aria-busy={submitting}>
          {register && <div>
            <label className="field-label" htmlFor="name">Nombre completo</label>
            <input className="input" id="name" name="name" autoComplete="name" value={values.name} onChange={(event) => update('name', event.target.value)} placeholder="Tu nombre y apellido" required disabled={submitting} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
            <FieldError id="name-error">{errors.name}</FieldError>
          </div>}
          <div>
            <label className="field-label" htmlFor="email">Correo electrónico</label>
            <input className="input" id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="nombre@universidad.edu.pe" required disabled={submitting} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
            <FieldError id="email-error">{errors.email}</FieldError>
          </div>
          <div>
            <label className="field-label" htmlFor="password">Contraseña</label>
            <input className="input" id="password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} value={values.password} onChange={(event) => update('password', event.target.value)} placeholder={register ? 'Crea una contraseña segura' : 'Escribe tu contraseña'} required disabled={submitting} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : register ? 'password-help' : undefined} />
            {register && <p id="password-help" className="mt-2 text-sm text-slate-500">Utiliza entre 8 y 72 caracteres.</p>}
            <FieldError id="password-error">{errors.password}</FieldError>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>{submitting ? (register ? 'Creando cuenta…' : 'Ingresando…') : (register ? 'Crear mi cuenta' : 'Iniciar sesión')}</button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-600">{register ? '¿Ya tienes una cuenta?' : '¿Es tu primera vez?'} <Link to={register ? '/login' : '/register'} className="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4">{register ? 'Inicia sesión' : 'Crea una cuenta'}</Link></p>
      </div>
      <p className="text-center text-sm text-slate-400">Un espacio para escuchar. Un campus para todos.</p>
    </main>
  </div>
}
