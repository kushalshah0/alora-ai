import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Download } from 'lucide-react'
import { Button } from '../ui/Button'
import type { Conversation, Message } from '../../context/ChatContext'
import logoImage from '../../assets/logo.jpg'

export function MessageList({ conversation }: { conversation: Conversation }) {
  const handleDownloadImage = async (imageUrl: string, fileName?: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `alora-ai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download image: ', err)
    }
  }

  const extractImageFromMarkdown = (content: string) => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const matches = [...content.matchAll(imageRegex)]
    return matches.map(match => match[1])
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
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base select-none transition-all duration-200 overflow-hidden">
            {m.role === 'assistant' ? (
              <img 
                src={logoImage} 
                alt="Alora AI" 
                className="w-full h-full object-cover"
              />
            ) : '👤'}
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
                      img: ({src, alt, ...props}: any) => {
                        if (!src) return null
                        
                        return (
                          <div className="my-4 max-w-md">
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                              <img 
                                src={src} 
                                alt={alt || ''} 
                                className="w-full h-auto object-cover"
                                {...props}
                              />
                            </div>
                          </div>
                        )
                      },
                      code: ({className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match
                        
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
            {m.role === 'assistant' && m.status !== 'streaming' && m.status !== 'error' && (() => {
              const images = extractImageFromMarkdown(m.content)
              const hasImages = images.length > 0
              
              return hasImages ? (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    {images.map((imageUrl, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadImage(imageUrl, `alora-ai-image-${index + 1}.png`)}
                        className="flex items-center justify-center transition-colors duration-200 border border-white/50 hover:border-white/80"
                        title="Download image"
                      >
                        <Download size={14} />
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null
            })()}
          </div>
        </div>
      ))}
    </div>
  )
} 