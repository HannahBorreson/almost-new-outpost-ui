import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import { clearToken, getToken, isTokenExpired, saveToken } from './tokenStorage'
import { AuthContext } from './useAuth'

// Holds who is signed in. This is the app's only global state.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => getToken())
  // true until we've checked any token saved from a previous visit
  const [isChecking, setIsChecking] = useState(true)

  // On app start: throw away an expired token, otherwise ask the API who we are.
  useEffect(() => {
    let ignore = false
    const storedToken = getToken()

    if (!storedToken || isTokenExpired(storedToken)) {
      clearToken()
      setToken(null)
      setIsChecking(false)
      return
    }

    authApi
      .getMe()
      .then((me) => {
        if (!ignore) setUser(me)
      })
      .catch(() => {
        if (!ignore) {
          clearToken()
          setToken(null)
        }
      })
      .finally(() => {
        if (!ignore) setIsChecking(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const login = useCallback(async (username, password, rememberMe) => {
    const result = await authApi.login(username, password)
    saveToken(result.accessToken, rememberMe)
    setToken(result.accessToken)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isChecking,
      isAdmin: user?.role === 'MerchantAdmin',
      login,
      logout,
    }),
    [user, token, isChecking, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
