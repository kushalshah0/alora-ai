import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/helpers'

export type Message = { id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp: string; status?: 'sent' | 'error' | 'streaming' }
export type Conversation = { id: string; title: string; provider: 'closerouter' | 'openai' | 'anthropic' | 'openrouter'; model: string; messages: Message[]; createdAt: string; updatedAt: string }

export type ChatState = { conversations: Record<string, Conversation>; activeConversation?: string }

type ChatContextValue = {
  state: ChatState
  list: Conversation[]
  active?: Conversation
  createConversation: (init?: Partial<Pick<Conversation, 'title' | 'provider' | 'model'>>) => Conversation
  setActive: (id: string) => void
  addMessage: (id: string, msg: Omit<Message, 'id' | 'timestamp'>) => Message
  updateMessage: (id: string, msgId: string, patch: Partial<Message>) => void
  clearConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  setModel: (id: string, model: string) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function loadChat(): ChatState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT)
    return raw ? (JSON.parse(raw) as ChatState) : { conversations: {}, activeConversation: undefined }
  } catch {
    return { conversations: {}, activeConversation: undefined }
  }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>(loadChat())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(state))
  }, [state])

  const list = useMemo(() => Object.values(state.conversations).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)), [state.conversations])
  const active = useMemo(() => (state.activeConversation ? state.conversations[state.activeConversation] : undefined), [state])

  const createConversation = useCallback((init?: Partial<Pick<Conversation, 'title' | 'provider' | 'model'>>) => {
    const id = generateId('conv')
    const now = new Date().toISOString()
    const convo: Conversation = {
      id,
      title: init?.title || 'New Chat',
      provider: (init?.provider as any) || 'openrouter',
      model: init?.model || 'openai/gpt-oss-20b:free',
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
    setState(s => ({ conversations: { ...s.conversations, [id]: convo }, activeConversation: id }))
    return convo
  }, [])

  const setActive = useCallback((id: string) => setState(s => ({ ...s, activeConversation: id })), [])

  const addMessage = useCallback((id: string, msg: Omit<Message, 'id' | 'timestamp'>) => {
    const mid = generateId('msg')
    const now = new Date().toISOString()
    setState(s => {
      const convo = s.conversations[id]
      if (!convo) return s
      
      const newMessage = { ...msg, id: mid, timestamp: now }
      const updatedMessages = [...convo.messages, newMessage]
      
      // Auto-rename chat based on first user message
      let updatedTitle = convo.title
      if (msg.role === 'user' && convo.messages.length === 0 && convo.title === 'New Chat') {
        // Generate title from first user message (first 50 characters, clean up)
        const title = msg.content.trim().slice(0, 50)
          .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim()
        updatedTitle = title || 'New Chat'
        
        // If title is too short, try to make it more descriptive
        if (updatedTitle.length < 10) {
          updatedTitle = msg.content.trim().slice(0, 30).trim() || 'New Chat'
        }
      }
      
      const next: Conversation = { 
        ...convo, 
        title: updatedTitle,
        messages: updatedMessages, 
        updatedAt: now 
      }
      return { ...s, conversations: { ...s.conversations, [id]: next } }
    })
    return { id: mid, ...msg, timestamp: now }
  }, [])

  const updateMessage = useCallback((id: string, msgId: string, patch: Partial<Message>) => {
    setState(s => {
      const convo = s.conversations[id]
      if (!convo) return s
      const messages = convo.messages.map(m => (m.id === msgId ? { ...m, ...patch } : m))
      const next: Conversation = { ...convo, messages, updatedAt: new Date().toISOString() }
      return { ...s, conversations: { ...s.conversations, [id]: next } }
    })
  }, [])

  const clearConversation = useCallback((id: string) => {
    setState(s => {
      const convo = s.conversations[id]
      if (!convo) return s
      const next: Conversation = { ...convo, messages: [], updatedAt: new Date().toISOString() }
      return { ...s, conversations: { ...s.conversations, [id]: next } }
    })
  }, [])

  const deleteConversation = useCallback((id: string) => {
    setState(s => {
      const next = { ...s.conversations }
      delete next[id]
      const activeConversation = s.activeConversation === id ? Object.keys(next)[0] : s.activeConversation
      return { conversations: next, activeConversation }
    })
  }, [])

  const renameConversation = useCallback((id: string, title: string) => {
    setState(s => {
      const convo = s.conversations[id]
      if (!convo) return s
      const next: Conversation = { ...convo, title, updatedAt: new Date().toISOString() }
      return { ...s, conversations: { ...s.conversations, [id]: next } }
    })
  }, [])

  const setModel = useCallback((id: string, model: string) => {
    setState(s => {
      const convo = s.conversations[id]
      if (!convo) return s
      const next: Conversation = { ...convo, model, updatedAt: new Date().toISOString() }
      return { ...s, conversations: { ...s.conversations, [id]: next } }
    })
  }, [])

  const value = useMemo(() => ({ state, list, active, createConversation, setActive, addMessage, updateMessage, clearConversation, deleteConversation, renameConversation, setModel }), [state, list, active, createConversation, setActive, addMessage, updateMessage, clearConversation, deleteConversation, renameConversation, setModel])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
} 