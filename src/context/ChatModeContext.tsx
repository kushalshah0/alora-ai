import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export type ChatMode = 'text' | 'image'

type ChatModeContextValue = {
  mode: ChatMode
  setMode: (mode: ChatMode) => void
  toggleMode: () => void
  resetActivity: () => void
  setConversationId: (id: string | null) => void
}

const ChatModeContext = createContext<ChatModeContextValue | undefined>(undefined)

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds
const CHAT_MODES_STORAGE_KEY = 'alora-chat-modes'

// Helper function to get stored modes from localStorage
const getStoredModes = (): Record<string, ChatMode> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(CHAT_MODES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Helper function to save modes to localStorage
const saveStoredModes = (modes: Record<string, ChatMode>) => {
  try {
    localStorage.setItem(CHAT_MODES_STORAGE_KEY, JSON.stringify(modes))
  } catch {
    // Handle localStorage errors silently
  }
}

export function ChatModeProvider({ children }: { children: React.ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversationModes, setConversationModes] = useState<Record<string, ChatMode>>(getStoredModes)
  const timeoutRef = useRef<number | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Get current mode based on active conversation
  const mode = useMemo(() => {
    if (!currentConversationId) return 'text'
    return conversationModes[currentConversationId] || 'text'
  }, [currentConversationId, conversationModes])

  const clearInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const updateConversationMode = useCallback((conversationId: string, newMode: ChatMode) => {
    setConversationModes(prev => {
      const updated = { ...prev, [conversationId]: newMode }
      saveStoredModes(updated)
      return updated
    })
  }, [])

  const resetToTextMode = useCallback(() => {
    if (mode === 'image' && currentConversationId) {
      updateConversationMode(currentConversationId, 'text')
    }
  }, [mode, currentConversationId, updateConversationMode])

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer()
    
    // Only start timer if we're in image mode
    if (mode === 'image') {
      timeoutRef.current = setTimeout(() => {
        resetToTextMode()
      }, INACTIVITY_TIMEOUT)
    }
  }, [mode, clearInactivityTimer, resetToTextMode])

  const setMode = useCallback((newMode: ChatMode) => {
    if (currentConversationId) {
      updateConversationMode(currentConversationId, newMode)
    }
    lastActivityRef.current = Date.now()
  }, [currentConversationId, updateConversationMode])

  const toggleMode = useCallback(() => {
    if (currentConversationId) {
      const newMode = mode === 'text' ? 'image' : 'text'
      updateConversationMode(currentConversationId, newMode)
      lastActivityRef.current = Date.now()
    }
  }, [currentConversationId, mode, updateConversationMode])

  const setConversationId = useCallback((id: string | null) => {
    setCurrentConversationId(id)
    // When switching to a new conversation, clear any existing timer
    clearInactivityTimer()
  }, [clearInactivityTimer])

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    startInactivityTimer()
  }, [startInactivityTimer])

  // Start/restart timer when mode changes to image
  useEffect(() => {
    if (mode === 'image') {
      startInactivityTimer()
    } else {
      clearInactivityTimer()
    }

    return () => clearInactivityTimer()
  }, [mode, startInactivityTimer, clearInactivityTimer])

  // Clean up on unmount
  useEffect(() => {
    return () => clearInactivityTimer()
  }, [clearInactivityTimer])

  const value = useMemo(() => ({
    mode,
    setMode,
    toggleMode,
    resetActivity,
    setConversationId
  }), [mode, setMode, toggleMode, resetActivity, setConversationId])

  return (
    <ChatModeContext.Provider value={value}>
      {children}
    </ChatModeContext.Provider>
  )
}

export function useChatMode() {
  const ctx = useContext(ChatModeContext)
  if (!ctx) throw new Error('useChatMode must be used within ChatModeProvider')
  return ctx
}