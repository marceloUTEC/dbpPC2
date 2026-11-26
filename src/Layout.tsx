import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { Brand, Icon } from './components'

export function Layout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function logout() {
    signOut()
    navigate('/login', { replace: true })
  }

  return <div className="flex min-h-screen flex-col">
    <a className="skip-link" href="#main">Saltar al contenido</a>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Brand />
        <button onClick={logout} type="button" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"><Icon name="logout" /><span>Cerrar sesión</span></button>
      </div>
      <nav aria-label="Navegación principal" className="mx-auto flex max-w-6xl gap-6 px-5 sm:px-8">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon name="grid" />Espacios del campus</NavLink>
        <NavLink to="/my-tickets" className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}><Icon name="ticket" />Mis solicitudes</NavLink>
      </nav>
    </header>
    <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 outline-none sm:px-8 sm:py-10"><Outlet /></main>
    <footer className="mt-8 border-t border-slate-200 px-5 py-6 text-sm text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 sm:px-3"><span>AUlaSoporte · Comunidad universitaria</span><span>Un mejor campus empieza contigo.</span></div>
    </footer>
  </div>
}
