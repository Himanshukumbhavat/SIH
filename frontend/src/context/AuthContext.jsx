// Auth context — email + password login.
// Stores the signed-in user in React context and mirrors to sessionStorage
// so a page refresh doesn't drop the session.
import { createContext, useContext, useState } from 'react'
import { authenticateUser, ROLES } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const stored = sessionStorage.getItem('dems_user')
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null)

  /** Attempt login with email + password. Returns { success, error }. */
  function login(email, password) {
    const found = authenticateUser(email, password)
    if (!found) return { success: false, error: 'Invalid email or password.' }
    const record = { ...found, roleInfo: ROLES[found.role] }
    // Don't store the password in session
    delete record.password
    setUser(record)
    sessionStorage.setItem('dems_user', JSON.stringify(record))
    return { success: true }
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem('dems_user')
  }

  /** Check if the signed-in user has a specific permission. */
  function hasPermission(code) {
    return !!user && user.roleInfo?.permissions?.includes(code)
  }

  /** True if user is an uploader (can upload evidence). */
  const canUpload = !!user && user.role === 'UPLOADER'

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, canUpload }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
