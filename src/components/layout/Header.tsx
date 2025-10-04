import { Menu } from 'lucide-react'
import { Button } from '../ui/Button'
import { useChat } from '../../hooks/useChat'
import { ModelDropdown } from '../chat/ModelDropdown'
import { TEXT_MODELS, IMAGE_MODELS, getDefaultModelForMode } from '../../utils/constants'
import { useUI } from '../../context/UIContext'
import { useChatMode } from '../../context/ChatModeContext'
import { useEffect } from 'react'
import logoImage from '../../assets/logo.jpg'

export function Header() {
  const { active, setModel } = useChat()
  const { toggleSidebar, setMobileSidebarOpen } = useUI()
  const { mode } = useChatMode()

  function handleHamburger() {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) toggleSidebar()
    else setMobileSidebarOpen(true)
  }

  const availableModels = mode === 'text' ? TEXT_MODELS : IMAGE_MODELS

  // Auto-switch model when mode changes
  useEffect(() => {
    if (active) {
      const currentModelIsValid = availableModels.includes(active.model)
      if (!currentModelIsValid) {
        const defaultModel = getDefaultModelForMode(mode)
        setModel(active.id, defaultModel)
      }
    }
  }, [mode, active, availableModels, setModel])

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleHamburger} aria-label="Toggle sidebar">
            <Menu size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src={logoImage} 
              alt="Alora AI" 
              className="w-8 h-8 rounded-md object-cover"
            />
            <h1 className="text-lg font-semibold">Alora AI</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {active && (
            <ModelDropdown 
              value={active.model} 
              options={availableModels} 
              onChange={(v) => setModel(active.id, v)} 
            />
          )}
        </div>
      </div>
    </header>
  )
} 