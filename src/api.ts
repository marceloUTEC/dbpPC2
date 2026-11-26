import axios from 'axios'
import type { CampusLocation, LocationPage, Ticket } from './types'

export const TOKEN_KEY = 'aulasoporte.token'
export const SESSION_EXPIRED = 'aulasoporte:session-expired'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || 'https://aulasoporte-api.aaron-navarro.workers.dev/api',
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  if (!config.url?.startsWith('/auth/')) {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      const token = getToken()
      if (!token || error.config?.headers.Authorization === `Bearer ${token}`) {
        localStorage.removeItem(TOKEN_KEY)
        window.dispatchEvent(new Event(SESSION_EXPIRED))
      }
    }
    return Promise.reject(error)
  },
)

export function apiError(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (typeof error.response?.data?.message === 'string' && error.response.data.message.trim()) return error.response.data.message
    if (error.response?.status === 401) return 'El correo o la contraseña son incorrectos.'
    if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Vuelve a intentarlo.'
    if (!error.response) return 'No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.'
  }
  return 'No pudimos completar la solicitud. Vuelve a intentarlo.'
}

export const api = {
  register: (name: string, email: string, password: string) =>
    client.post('/auth/register', { name, email, password }),
  login: async (email: string, password: string) =>
    (await client.post<{ token: string }>('/auth/login', { email, password })).data,
  locations: async (page: number, signal: AbortSignal) =>
    (await client.get<LocationPage>('/locations', { params: { page, size: 5 }, signal })).data,
  location: async (id: string, signal: AbortSignal) =>
    (await client.get<CampusLocation>(`/locations/${encodeURIComponent(id)}`, { signal })).data,
  createTicket: async (id: string, description: string) =>
    (await client.post<Ticket>(`/locations/${encodeURIComponent(id)}/tickets`, { description })).data,
  tickets: async (signal: AbortSignal) =>
    (await client.get<Ticket[]>('/me/tickets', { signal })).data,
  closeTicket: async (id: number) =>
    (await client.patch<Ticket>(`/tickets/${id}/close`)).data,
}
