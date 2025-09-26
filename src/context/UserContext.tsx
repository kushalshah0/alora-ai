import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { encryptString, decryptString } from '../services/storage'

type ProviderKeys = Partial<Record<'closerouter' | 'openai' | 'anthropic', string>>

type UserRecord = {
  username: string
  name: string
  apiKeys: ProviderKeys // encrypted base64 strings
  preferences: {
    theme?: 'light' | 'dark'
    defaultProvider?: 'closerouter' | 'openai' | 'anthropic'
    defaultModel?: string
    temperature?: number
    systemPrompt?: string
  }
}

type UsersMap = Record<string, UserRecord>

type UserContextValue = {
  users: UsersMap
  currentUser?: string
  setCurrentUser: (username: string) => void
  upsertUser: (u: UserRecord) => void
  getApiKey: (provider: keyof ProviderKeys) => Promise<string | undefined>
  setApiKey: (provider: keyof ProviderKeys, key: string) => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

function loadUsers(): { users: UsersMap; currentUser?: string } {
  try {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}') as UsersMap
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || undefined
    return { users, currentUser }
  } catch {
    return { users: {}, currentUser: undefined }
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const initial = loadUsers()
  const [users, setUsers] = useState<UsersMap>(initial.users)
  const [currentUser, setCurrentUserState] = useState<string | undefined>(initial.currentUser)

  const persist = useCallback((next: UsersMap, user?: string) => {
    setUsers(next)
    if (user !== undefined) setCurrentUserState(user)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(next))
    if (user !== undefined) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user)
  }, [])

  const setCurrentUser = useCallback((username: string) => {
    persist(users, username)
  }, [persist, users])

  const upsertUser = useCallback((u: UserRecord) => {
    const next = { ...users, [u.username]: u }
    persist(next, currentUser ?? u.username)
  }, [users, persist, currentUser])

  const getApiKey = useCallback(async (provider: keyof ProviderKeys) => {
    if (!currentUser) return undefined
    const enc = users[currentUser]?.apiKeys?.[provider]
    return enc ? await decryptString(enc) : undefined
  }, [currentUser, users])

  const setApiKey = useCallback(async (provider: keyof ProviderKeys, key: string) => {
    if (!currentUser) return
    const enc = await encryptString(key)
    const user = users[currentUser]
    const nextUser: UserRecord = { ...user, apiKeys: { ...(user.apiKeys || {}), [provider]: enc } }
    const next = { ...users, [currentUser]: nextUser }
    persist(next)
  }, [currentUser, users, persist])

  const value = useMemo(() => ({ users, currentUser, setCurrentUser, upsertUser, getApiKey, setApiKey }), [users, currentUser, setCurrentUser, upsertUser, getApiKey, setApiKey])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
} 