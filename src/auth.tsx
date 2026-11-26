import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getToken, SESSION_EXPIRED, TOKEN_KEY } from './api'

interface AuthState {
  token: string | null
  expired: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getToken)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    function onExpired() {
      setToken(null)
      setExpired(true)
    }
    function onStorage(event: StorageEvent) {
      if (event.key === TOKEN_KEY || event.key === null) setToken(getToken())
    }
    window.addEventListener(SESSION_EXPIRED, onExpired)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SESSION_EXPIRED, onExpired)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function signIn(nextToken: string) {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setExpired(false)
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setExpired(false)
  }

  return <AuthContext.Provider value={{ token, expired, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('Se requiere AuthProvider.')
  return auth
}

export function ProtectedRoute() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
