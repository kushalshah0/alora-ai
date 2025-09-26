import { useCallback, useState } from 'react'
import { useChatContext } from '../context/ChatContext'
import { sendAIRequest, type ChatMessage } from '../services/aiProviders'

function getErrorMessage(error: any): string {
  const message = error?.message || 'Unknown error'
  
  if (message.includes('HTTP 401') || message.includes('Unauthorized')) {
    return 'Authentication failed. Please check your API key configuration.'
  }
  if (message.includes('HTTP 429') || message.includes('rate limit')) {
    return 'Rate limit exceeded. Please wait a moment and try again, or switch to a different model.'
  }
  if (message.includes('HTTP 403') || message.includes('Forbidden')) {
    return 'Access denied. This model may not be available with your current plan. Try switching to a different model.'
  }
  if (message.includes('HTTP 404')) {
    return 'Model not found. Please try switching to a different model from the dropdown above.'
  }
  if (message.includes('HTTP 500') || message.includes('Internal Server Error')) {
    return 'Server error occurred. Please try again in a moment or switch to a different model.'
  }
  if (message.includes('HTTP 502') || message.includes('HTTP 503') || message.includes('HTTP 504')) {
    return 'Service temporarily unavailable. Please try again or switch to a different model.'
  }
  if (message.includes('NetworkError') || message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.'
  }
  
  return `Error occurred: ${message}. Try switching to a different model or try again.`
}

export function useAI() {
  const { active, addMessage, updateMessage } = useChatContext()
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(async (apiKey: string, opts?: { stream?: boolean; temperature?: number; max_tokens?: number }, latestUserMessage?: string) => {
    if (!active) return
    setError(null)
    setIsTyping(true)
    
    let assistantMessage: any = null
    
    try {
      const messages: ChatMessage[] = active.messages.map(m => ({ role: m.role, content: m.content }))
      if (latestUserMessage) {
        messages.push({ role: 'user', content: latestUserMessage })
      }
      if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
        setIsTyping(false)
        return
      }
      
      assistantMessage = addMessage(active.id, { role: 'assistant', content: '', status: 'streaming' })
      const model = active.model || 'deepseek/deepseek-chat-v3.1:free'
      const provider = active.provider || 'openrouter'
      let buffered = ''
      
      const content = await sendAIRequest(
        messages,
        { provider, apiKey, model, stream: opts?.stream, temperature: opts?.temperature, max_tokens: opts?.max_tokens },
        token => {
          buffered += token
          updateMessage(active.id, assistantMessage.id, { content: buffered })
        }
      )
      
      updateMessage(active.id, assistantMessage.id, { content, status: 'sent' })
    } catch (e: any) {
      const errorMessage = getErrorMessage(e)
      setError(errorMessage)
      
      // If we created an assistant message, update it with the error
      if (assistantMessage) {
        updateMessage(active.id, assistantMessage.id, { 
          content: `**Error**: ${errorMessage}`, 
          status: 'error'
        })
      }
    } finally {
      setIsTyping(false)
    }
  }, [active, addMessage, updateMessage])

  return { isTyping, error, send }
} 