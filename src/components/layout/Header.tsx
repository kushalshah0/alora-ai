import { Menu } from 'lucide-react'
import { Button } from '../ui/Button'
import { useChat } from '../../hooks/useChat'
import { ModelDropdown } from '../chat/ModelDropdown'
import { DEFAULT_MODELS } from '../../utils/constants'
import { useUI } from '../../context/UIContext'

export function Header() {
  const { active, setModel } = useChat()
  const { toggleSidebar, setMobileSidebarOpen } = useUI()

  function handleHamburger() {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (isDesktop) toggleSidebar()
    else setMobileSidebarOpen(true)
  }

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleHamburger} aria-label="Toggle sidebar">
            <Menu size={18} />
          </Button>
          <h1 className="text-lg font-semibold">ChudAI</h1>
        </div>
        <div className="flex items-center gap-2">
          {active && (
            <ModelDropdown value={active.model} options={DEFAULT_MODELS.openrouter} onChange={(v) => setModel(active.id, v)} />
          )}
        </div>
      </div>
    </header>
  )
} 