import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type UIState = {
  sidebarVisible: boolean
  setSidebarVisible: (v: boolean) => void
  toggleSidebar: () => void
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (v: boolean) => void
  toggleMobileSidebar: () => void
}

const UIContext = createContext<UIState | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisibleState] = useState<boolean>(true)
  const [mobileSidebarOpen, setMobileSidebarOpenState] = useState<boolean>(false)

  const setSidebarVisible = useCallback((v: boolean) => setSidebarVisibleState(v), [])
  const toggleSidebar = useCallback(() => setSidebarVisibleState(v => !v), [])

  const setMobileSidebarOpen = useCallback((v: boolean) => setMobileSidebarOpenState(v), [])
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpenState(v => !v), [])

  const value = useMemo(
    () => ({ sidebarVisible, setSidebarVisible, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen, toggleMobileSidebar }),
    [sidebarVisible, setSidebarVisible, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen, toggleMobileSidebar]
  )
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
} 