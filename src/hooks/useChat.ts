import { useMemo, useState } from 'react'
import { useChatContext } from '../context/ChatContext'

export function useChat() {
  const { state, list, active, createConversation, setActive, addMessage, updateMessage, clearConversation, deleteConversation, renameConversation, setModel } = useChatContext()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return list
    return list.filter(c => c.title.toLowerCase().includes(q) || c.messages.some(m => m.content.toLowerCase().includes(q)))
  }, [query, list])

  return { state, list: filtered, active, createConversation, setActive, addMessage, updateMessage, clearConversation, deleteConversation, renameConversation, setModel, query, setQuery }
} 