import './index.css'
import { UserProvider } from './context/UserContext'
import { ChatProvider } from './context/ChatContext'
import { Header } from './components/layout/Header'
import { Layout } from './components/layout/Layout'
import { ConversationSidebar } from './components/chat/ConversationSidebar'
import { ChatInterface } from './components/chat/ChatInterface'
import { MobileSidebar } from './components/layout/MobileSidebar'
import { UIProvider, useUI } from './context/UIContext'

function Main() {
  const { sidebarVisible, mobileSidebarOpen, setMobileSidebarOpen } = useUI()
  return (
    <>
      <Layout>
        <Header />
        <div className="flex-1 flex min-h-0 gap-4 px-4 md:px-6 py-4">
          {sidebarVisible && <ConversationSidebar />}
          <ChatInterface />
        </div>
      </Layout>
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
    </>
  )
}

function App() {
  return (
      <UserProvider>
        <ChatProvider>
          <UIProvider>
            <Main />
          </UIProvider>
        </ChatProvider>
      </UserProvider>
  )
}

export default App
