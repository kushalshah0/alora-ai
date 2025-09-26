import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Edit2, Trash2 } from 'lucide-react'
import type { Conversation } from '../../context/ChatContext'

interface ChatActionsModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
  initialMode?: 'actions' | 'rename' | 'delete'
}

export function ChatActionsModal({ isOpen, onClose, conversation, onRename, onDelete, initialMode = 'actions' }: ChatActionsModalProps) {
  const [mode, setMode] = useState<'actions' | 'rename' | 'delete'>(initialMode)
  const [newTitle, setNewTitle] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClose = () => {
    setMode(initialMode)
    setNewTitle('')
    setIsDeleting(false)
    onClose()
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewTitle('')
      setIsDeleting(false)
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  // Update mode when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  // Update title when conversation changes or modal opens
  useEffect(() => {
    if (isOpen && conversation) {
      setNewTitle(conversation.title)
    }
  }, [isOpen, conversation])

  const handleRename = () => {
    if (!conversation) {
      console.error('No conversation selected')
      return
    }
    
    const trimmedTitle = newTitle.trim()
    if (!trimmedTitle) {
      console.error('Empty title')
      return
    }
    
    if (trimmedTitle === conversation.title) {
      console.log('Title unchanged, closing modal')
      handleClose()
      return
    }
    
    console.log('Renaming conversation:', conversation.id, 'from:', conversation.title, 'to:', trimmedTitle)
    onRename(conversation.id, trimmedTitle)
    handleClose()
  }

  const handleDelete = () => {
    if (conversation) {
      setIsDeleting(true)
      onDelete(conversation.id)
      handleClose()
    }
  }

  if (!conversation) return null

  const renderActions = () => (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Manage "{conversation.title}"
      </div>
      
      <div className="space-y-2">
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => setMode('rename')}
        >
          <Edit2 size={16} className="mr-2" />
          Rename conversation
        </Button>
        
        <Button
          variant="secondary"
          className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => setMode('delete')}
        >
          <Trash2 size={16} className="mr-2" />
          Delete conversation
        </Button>
      </div>
    </div>
  )

  const renderRename = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Enter a new name for this conversation
      </div>
      
      <Input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Conversation title"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleRename()
          if (e.key === 'Escape') handleClose()
        }}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleRename}
          disabled={!newTitle.trim() || newTitle.trim() === conversation.title}
        >
          Rename
        </Button>
      </div>
    </div>
  )

  const renderDelete = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Are you sure you want to delete "{conversation.title}"?
      </div>
      
      <div className="text-xs text-red-600 dark:text-red-400">
        This action cannot be undone. All messages in this conversation will be permanently deleted.
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="secondary"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  )

  const getTitle = () => {
    switch (mode) {
      case 'rename': return 'Rename Conversation'
      case 'delete': return 'Delete Conversation'
      default: return 'Chat Actions'
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={getTitle()}
      className="max-w-md"
    >
      {mode === 'actions' && renderActions()}
      {mode === 'rename' && renderRename()}
      {mode === 'delete' && renderDelete()}
    </Modal>
  )
}