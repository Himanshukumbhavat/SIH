// Auth context — email + password login.
// Stores the signed-in user in React context and mirrors to sessionStorage
// so a page refresh doesn't drop the session.
import { createContext, useContext, useRef, useState } from 'react'
import { authenticateUser, ROLES } from '../data/mockData'
import { createSecret, getOtpAuthUri, verifyTotpCode } from '../lib/totp'

const AuthContext = createContext(null)
const SESSION_KEY = 'dems_user_up_ghaziabad'

export function AuthProvider({ children }) {
  const stored = sessionStorage.getItem(SESSION_KEY)
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null)
  const [pendingLogin, setPendingLogin] = useState(null)
  const mfaAttempts = useRef(0)

  /** Attempt login with email + password. Returns { success, error }. */
  function login(email, password) {
    const found = authenticateUser(email, password)
    if (!found) return { success: false, error: 'Invalid email or password.' }
    const record = { ...found, roleInfo: ROLES[found.role] }
    // Don't store the password in session
    delete record.password
    const secret = localStorage.getItem(`dems_totp_${record.email}`)
    mfaAttempts.current = 0
    setPendingLogin(record)
    const setup = secret ? null : (() => {
      const setupSecret = createSecret()
      return { secret: setupSecret, uri: getOtpAuthUri(record.email, setupSecret) }
    })()
    return { success: true, mfaRequired: Boolean(secret), mfaSetupRequired: !secret, setup }
  }

  async function verifyMfa(code, secret) {
    if (!pendingLogin) return { success: false, error: 'Your sign-in session expired.' }
    if (mfaAttempts.current >= 5) {
      setPendingLogin(null)
      return { success: false, error: 'Too many invalid codes. Sign in again.' }
    }
    const storedSecret = localStorage.getItem(`dems_totp_${pendingLogin.email}`)
    const activeSecret = storedSecret || secret
    if (!activeSecret || !(await verifyTotpCode(activeSecret, code))) {
      mfaAttempts.current += 1
      return { success: false, error: 'Invalid or expired authenticator code.' }
    }
    localStorage.setItem(`dems_totp_${pendingLogin.email}`, activeSecret)
    setUser(pendingLogin)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(pendingLogin))
    setPendingLogin(null)
    return { success: true }
  }

  function resetMfaSetup(email) {
    localStorage.removeItem(`dems_totp_${email.trim().toLowerCase()}`)
    setPendingLogin(null)
    mfaAttempts.current = 0
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  /** Check if the signed-in user has a specific permission. */
  function hasPermission(code) {
    return !!user && user.roleInfo?.permissions?.includes(code)
  }

  /** True if user is an uploader (can upload evidence). */
  const canUpload = !!user && user.role === 'UPLOADER'

  return (
    <AuthContext.Provider value={{ user, login, verifyMfa, resetMfaSetup, logout, hasPermission, canUpload }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
