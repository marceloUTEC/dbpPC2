import { useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute, useAuth } from './auth'
import { Layout } from './Layout'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { LocationDetail } from './pages/LocationDetail'
import { MyTickets } from './pages/MyTickets'
import { Brand } from './components'

export function App() {
  const { token } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    const title = pathname === '/login' ? 'Iniciar sesión' : pathname === '/register' ? 'Crear cuenta' : pathname === '/dashboard' ? 'Espacios del campus' : pathname === '/my-tickets' || pathname === '/my-operations' ? 'Mis solicitudes' : pathname.startsWith('/locations/') ? 'Detalle del espacio' : 'Inicio'
    document.title = `${title} | AUlaSoporte`
    window.scrollTo(0, 0)
  }, [pathname])

  return <Routes>
    <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    <Route path="/register" element={<AuthPage key="register" register />} />
    <Route path="/login" element={<AuthPage key="login" />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/locations/:id" element={<LocationDetail key={pathname} />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/my-operations" element={<Navigate to="/my-tickets" replace />} />
      </Route>
    </Route>
    <Route path="*" element={<main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-6 px-6"><Brand /><p className="eyebrow">PÁGINA NO ENCONTRADA</p><h1 className="text-4xl font-semibold text-slate-900">Parece que este espacio no existe.</h1><p className="text-slate-500">Revisa la dirección o vuelve al inicio para continuar.</p><Link to="/" className="btn-primary">Volver al inicio</Link></main>} />
  </Routes>
}
