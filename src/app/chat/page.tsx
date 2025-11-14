'use client'

import { useState, useEffect } from 'react'
import ChatSidebar from './components/chat-sidebar'
import ChatWindow from './components/chat-window'
import EmptyState from './components/empty-state'

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedChat) {
        setSelectedChat(null)
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedChat])

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:w-80 border-r border-border`}>
        <ChatSidebar 
          selectedChat={selectedChat} 
          onSelectChat={(id) => {
            setSelectedChat(id)
            setIsSidebarOpen(false)
          }} 
        />
      </div>

      {/* Chat Window or Empty State */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatWindow 
            chatId={selectedChat} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        ) : (
          <EmptyState onSelectChat={() => setIsSidebarOpen(true)} />
        )}
      </div>
    </div>
  )
}
