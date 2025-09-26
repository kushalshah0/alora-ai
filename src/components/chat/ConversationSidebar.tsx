import { useState } from 'react'
import { useChat } from '../../hooks/useChat'
import { Button } from '../ui/Button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { ChatActionsModal } from './ChatActionsModal'
import type { Conversation } from '../../context/ChatContext'

export function ConversationSidebar() {
  const { list, active, setActive, createConversation, deleteConversation, renameConversation } = useChat()
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

  return (
    <aside className="hidden md:flex md:flex-col flex-shrink-0 min-h-0 w-60 lg:w-72 xl:w-80 border-r border-gray-200 dark:border-gray-800 p-2 lg:p-3 bg-transparent">
      <div className="glass-soft rounded-xl p-3 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Chats</div>
          <Button size="sm" onClick={() => createConversation()}>
            <Plus size={16} className="mr-1" /> New
          </Button>
        </div>
        <div className="h-px bg-gray-200/60 dark:bg-gray-800/60" />
        <div className="flex-1 overflow-y-auto space-y-1">
          {list.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">
              No conversations yet. Create your first one.
              <div className="mt-3"><Button size="sm" onClick={() => createConversation()}>Start New Chat</Button></div>
            </div>
          )}
          {list.map(c => {
            const isActive = active?.id === c.id
            return (
              <div
                key={c.id}
                className={`group relative w-full rounded-lg transition border ${
                  isActive
                    ? 'bg-white/70 dark:bg-gray-900/50 border-gray-200/70 dark:border-gray-800/70 shadow-sm before:content-[""] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-500 before:rounded-r'
                    : 'hover:bg-white/50 dark:hover:bg-gray-900/40 border-transparent'
                }`}
              >
                <button
                  onClick={() => setActive(c.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="w-full text-left px-3 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{c.title}</div>
                    </div>
                  </div>
                </button>
                
                {/* Action buttons - visible on hover */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenRenameModal(c)
                    }}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150"
                    title="Rename conversation"
                    aria-label="Rename conversation"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDeleteModal(c)
                    }}
                    className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
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
    </aside>
  )
} 