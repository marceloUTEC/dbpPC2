import { useCallback, useEffect, useState } from 'react'
import { apiError } from './api'

export function useQuery<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState({
    fetcher,
    version,
    data: null as T | null,
    loading: true,
    error: '',
  })
  const retry = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setResult({ fetcher, version, data: null, loading: true, error: '' })
    fetcher(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setResult({ fetcher, version, data: result, loading: false, error: '' })
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ fetcher, version, data: null, loading: false, error: apiError(reason) })
        }
      })
    return () => controller.abort()
  }, [fetcher, version])

  const current = result.fetcher === fetcher && result.version === version
  return {
    data: current ? result.data : null,
    loading: !current || result.loading,
    error: current ? result.error : '',
    retry,
  }
}
