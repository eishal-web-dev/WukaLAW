import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  ApiError,
  clearAuthStorage,
  getMe,
  getStoredToken,
  getStoredUser,
  loginAccount,
  registerAccount,
  setAuthStorage,
} from './api'
import type { User } from './api'

interface AuthContextValue {
  user: User | null
  token: string | null
  /** True while a stored token is being validated on app start. */
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [loading, setLoading] = useState<boolean>(() => getStoredToken() !== null)

  // Validate any stored token once on app start.
  useEffect(() => {
    const stored = getStoredToken()
    if (!stored) return
    let cancelled = false
    getMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setAuthStorage(stored, me)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          clearAuthStorage()
          setToken(null)
          setUser(null)
        }
        // Network errors keep the cached session; protected endpoints will
        // enforce auth server-side anyway.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginAccount(email, password)
    setAuthStorage(res.token, res.user)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const res = await registerAccount(email, name, password)
      setAuthStorage(res.token, res.user)
      setToken(res.token)
      setUser(res.user)
    },
    [],
  )

  const logout = useCallback(() => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- context + hook intentionally live together
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
