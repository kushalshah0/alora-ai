import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { useState } from 'react'
import type { Conversation, Message } from '../../context/ChatContext'

export function MessageList({ conversation }: { conversation: Conversation }) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const handleCopy = async (messageId: string, content: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        // Fallback for older browsers or mobile devices
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        textArea.style.top = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
        } catch (fallbackErr) {
          console.error('Fallback copy failed: ', fallbackErr)
          throw fallbackErr
        } finally {
          document.body.removeChild(textArea)
        }
      }
      
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      // You could add a toast notification here to inform user of copy failure
    }
  }

  return (
    <div className="space-y-6">
      {conversation.messages.map((m: Message, index) => (
        <div 
          key={m.id} 
          className={`group flex items-start gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500 ${
            m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base select-none transition-all duration-200">
            {m.role === 'assistant' ? '🤖' : '👤'}
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <div className={`flex items-center gap-2 text-xs text-gray-500 transition-colors duration-200 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}>
            </div>
            <div className={`prose prose-sm dark:prose-invert max-w-none transition-all duration-200 ${
              m.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              {m.role === 'assistant' ? (
                <>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code: ({className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match
                        const codeContent = String(children).replace(/\n$/, '')
                        
                        if (isInline) {
                          return (
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          )
                        }
                        
                        return (
                          <div className="relative group my-2 max-w-full">
                            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-t-md border-b border-gray-200 dark:border-gray-700">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {match ? match[1] : 'code'}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`code-${Date.now()}`, codeContent)}
                                className="opacity-70 hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                title="Copy code"
                              >
                                <Copy size={12} />
                              </Button>
                            </div>
                            <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-b-md overflow-x-auto text-sm max-w-full">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        )
                      }
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                  {m.status === 'streaming' && (
                    <div className="inline-flex items-center gap-1 text-gray-500 animate-pulse">
                      <span>Thinking</span>
                      <span className="animate-bounce" style={{animationDelay: '0ms'}}>.</span>
                      <span className="animate-bounce" style={{animationDelay: '150ms'}}>.</span>
                      <span className="animate-bounce" style={{animationDelay: '300ms'}}>.</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
            {m.role === 'assistant' && m.status !== 'streaming' && m.status !== 'error' && (
              <div className="mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCopy(m.id, m.content)} 
                  className={`flex items-center justify-center transition-colors duration-200 ${
                    copiedMessageId === m.id ? 'text-green-600' : ''
                  }`}
                  title={copiedMessageId === m.id ? 'Copied!' : 'Copy message'}
                >
                  {copiedMessageId === m.id ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 