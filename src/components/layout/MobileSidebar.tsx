import { useEffect, useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { Button } from '../ui/Button'
import { Search, Plus, MessageSquareText, Edit2, Trash2 } from 'lucide-react'
import { ChatActionsModal } from '../chat/ChatActionsModal'
import type { Conversation } from '../../context/ChatContext'

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { list, active, setActive, createConversation, deleteConversation, renameConversation, query, setQuery } = useChat()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [modalMode, setModalMode] = useState<'rename' | 'delete'>('rename')

  const handleOpenRenameModal = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setModalMode('rename')
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setModalMode('delete')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedConversation(null)
  }

  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (open) {
      window.addEventListener('keydown', onEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Enhanced backdrop with stronger blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Right side blur effect */}
      <div className="absolute inset-y-0 left-[85vw] right-0 bg-gradient-to-r from-black/10 via-black/5 to-transparent backdrop-blur-sm pointer-events-none" />
      
      {/* Sidebar panel with full height */}
      <div className={`absolute inset-y-0 left-0 w-[85vw] max-w-sm bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
            <Button size="sm" onClick={() => { createConversation(); onClose() }}>
              <Plus size={16} className="mr-1" /> New
            </Button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search conversations..."
              className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <MessageSquareText size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No conversations yet</p>
              <Button size="sm" onClick={() => { createConversation(); onClose() }}>
                <Plus size={16} className="mr-1" /> Start Your First Chat
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map(c => {
                const isActive = active?.id === c.id
                return (
                  <div
                    key={c.id}
                    className={`group relative w-full rounded-xl transition-all duration-200 border ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => { setActive(c.id); onClose() }}
                      className="w-full text-left p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${
                            isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {c.title}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Action buttons - always visible on mobile for better touch interaction */}
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenRenameModal(c)
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150"
                        title="Rename conversation"
                        aria-label="Rename conversation"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDeleteModal(c)
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                        title="Delete conversation"
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      <ChatActionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conversation={selectedConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
        initialMode={modalMode}
      />
    </div>
  )
} 