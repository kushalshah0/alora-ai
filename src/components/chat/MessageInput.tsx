import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Image } from 'lucide-react'
import { useChatMode } from '../../context/ChatModeContext'

export function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('')
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
        <div className="flex items-end gap-2 rounded-xl bg-white/70 dark:bg-gray-900/50 border border-gray-200/70 dark:border-gray-800/70 p-2 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-900/60 hover:border-gray-300/70 dark:hover:border-gray-700/70 hover:shadow-lg">
          <button
            aria-label={mode === 'text' ? 'Switch to Image Mode' : 'Switch to Text Mode'}
            onClick={toggleMode}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-md ${
              mode === 'image' 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Image size={18} className="transition-all duration-200" />
          </button>
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
            placeholder={mode === 'image' ? 'Generate an image...' : 'Type a message...'}
            className="flex-1 max-h-40 resize-none bg-transparent p-2 text-sm outline-none focus:ring-0 scrollbar-modern transition-all duration-200"
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