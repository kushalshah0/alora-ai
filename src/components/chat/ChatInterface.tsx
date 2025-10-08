import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { useAI } from '../../hooks/useAI'
import { useChatMode } from '../../context/ChatModeContext'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import logoImage from '../../assets/logo.jpg'

export function ChatInterface() {
  const { active, createConversation, addMessage } = useChat()
  const { isTyping, send } = useAI()
  const { setConversationId } = useChatMode()
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) {
      createConversation({})
    }
  }, [active])

  // Update the chat mode context when active conversation changes
  useEffect(() => {
    setConversationId(active?.id || null)
  }, [active?.id, setConversationId])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length])

  async function handleSend(text: string) {
    if (!active) return
    addMessage(active.id, { role: 'user', content: text, status: 'sent' })
    await send('', { stream: true }, text)
  }

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <div ref={scroller} className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          <div className="max-w-3xl mx-auto w-full px-2 sm:px-0 pb-24">
            {active && active.messages.length > 0 ? (
              <MessageList conversation={active} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-lg overflow-hidden border-1 border-white/20">
                    <img 
                      src={logoImage} 
                      alt="Alora AI" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Welcome to Alora AI
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    I'm here to help you with questions, writing, coding, analysis, and more. 
                    What would you like to explore today?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="group cursor-pointer p-3 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 hover:border-white/50 dark:hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-300">💡 Ask</div>
                    </div>
                    <div className="group cursor-pointer p-3 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 hover:border-white/50 dark:hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-300">💻 Code</div>
                    </div>
                    <div className="group cursor-pointer p-3 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 hover:border-white/50 dark:hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-300">✍️ Create</div>
                    </div>
                    <div className="group cursor-pointer p-3 rounded-xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-900/30 hover:border-white/50 dark:hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-300">📊 Analyze</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <MessageInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  )
} 