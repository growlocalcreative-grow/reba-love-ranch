import { createContext, useContext, useState, useEffect } from 'react'
import { account, ID } from '../lib/appwrite'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    try {
      const session = await account.get()
      setUser(session)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    await account.createEmailPasswordSession(email, password)
    const session = await account.get()
    setUser(session)
    return session
  }

  async function signup(email, password, name) {
    await account.create(ID.unique(), email, password, name)
    await login(email, password)
  }

  async function logout() {
    await account.deleteSession('current')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
