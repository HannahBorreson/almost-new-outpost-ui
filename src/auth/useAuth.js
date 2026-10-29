import { createContext, useContext } from 'react'

// The auth context object. AuthProvider (AuthContext.jsx) fills it in.
// It lives here so AuthContext.jsx only exports a component (keeps Vite's fast refresh happy).
export const AuthContext = createContext(null)

// const { user, isAdmin, login, logout } = useAuth()
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.')
  return value
}
