import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Sparkles, Image } from 'lucide-react'
import { useChatMode } from '../../context/ChatModeContext'
import { sendAIRequest, type ChatMessage } from '../../services/aiProviders'
import type { ProviderKey } from '../../utils/constants'

export function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const { mode, toggleMode, resetActivity } = useChatMode()

  function send() {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
    ref.current?.focus()
    autoSize()
    resetActivity() // Reset activity timer when sending a message
  }

  function handleTextChange(value: string) {
    setText(value)
    resetActivity() // Reset activity timer when typing
  }

  async function optimizePrompt() {
    if (!text.trim() || isOptimizing) return
    
    setIsOptimizing(true)
    resetActivity()
    
    try {
      // Use Pollinations text model for optimization
      const provider: ProviderKey = 'pollinations'
      const model = 'pollinations-text'

      const optimizationMessages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a prompt optimization expert. Your task is to take user prompts and make them more effective, clear, and specific while preserving the original intent. Make the prompt more detailed and actionable. Return only the optimized prompt without any explanations or additional text.'
        },
        {
          role: 'user',
          content: `Please optimize this prompt: "${text.trim()}"`
        }
      ]

      const response = await sendAIRequest(
        optimizationMessages,
        { 
          provider, 
          model,
          stream: false, 
          temperature: 0.3, 
          max_tokens: 500 
        }
      )

      if (response && typeof response === 'string') {
        const optimizedText = response.trim()
        setText(optimizedText)
        // Focus and position cursor at end after optimization
        setTimeout(() => {
          if (ref.current) {
            ref.current.focus()
            ref.current.setSelectionRange(optimizedText.length, optimizedText.length)
          }
          autoSize()
        }, 10)
      }
    } catch (error) {
      console.error('Failed to optimize prompt:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  function autoSize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  useEffect(() => { autoSize() }, [text])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        send()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [text])

  return (
    <div className="sticky bottom-0 bg-transparent transition-all duration-300 ease-in-out">
      <div className="max-w-3xl mx-auto w-full px-2 sm:px-0 pb-3 sm:pb-4 transition-all duration-200">
        <div className="relative flex items-center gap-1 rounded-xl bg-white/70 dark:bg-gray-900/50 border border-gray-200/70 dark:border-gray-800/70 p-2 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-900/60 hover:border-gray-300/70 dark:hover:border-gray-700/70 hover:shadow-lg">
          
          {/* Image mode toggle - left center */}
          <button
            onClick={toggleMode}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 ${
              mode === 'image' 
                ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <Image size={14} />
          </button>

          {mode === 'text' && text.trim() && (
            <button
              aria-label="Optimize Prompt"
              onClick={optimizePrompt}
              disabled={disabled || isOptimizing}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200 disabled:opacity-60"
            >
              <Sparkles size={14} className={`transition-all duration-200 ${isOptimizing ? 'animate-pulse' : ''}`} />
            </button>
          )}
          <textarea
            ref={ref}
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder={
              isOptimizing 
                ? 'Optimizing your prompt...' 
                : mode === 'image' 
                  ? 'Generate an image...' 
                  : 'Type a message...'
            }
            disabled={isOptimizing}
            className={`flex-1 max-h-40 resize-none bg-transparent p-2 text-sm outline-none focus:ring-0 scrollbar-modern transition-all duration-200 ${
              isOptimizing ? 'opacity-70' : ''
            }`}
          />
          <button
            aria-label="Send"
            disabled={disabled}
            onClick={send}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 transform hover:scale-105 active:scale-95 hover:shadow-md"
          >
            <ArrowUp size={18} className={`transition-transform duration-200 ${text.trim() ? 'scale-110' : 'scale-100'}`} />
          </button>
        </div>
      </div>
    </div>
  )
} 