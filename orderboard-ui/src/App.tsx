import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'
import OrderPage from './components/OrderPage'
import type { User } from './types'
import './App.css'

function App() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [queryResult, setQueryResult] = useState<any>(null)

  const mockUser: User = {
    name: 'Andrew Johnson',
    role: 'Printing Solutions',
    avatar: '/avatar-placeholder.svg'
  }

  const handleRightSidebarToggle = (collapsed: boolean) => {
    setRightSidebarCollapsed(collapsed)
    // When right sidebar expands, collapse left sidebar
    if (!collapsed) {
      setLeftSidebarCollapsed(true)
    }
  }

  const handleLeftSidebarToggle = (collapsed: boolean) => {
    setLeftSidebarCollapsed(collapsed)
  }

  const handleQueryResult = (result: any) => {
    setQueryResult(result)
  }

  return (
    <div className="app">
      <Header user={mockUser} />
      <div className="app-body">
        <Sidebar 
          activeItem="Orders" 
          isCollapsed={leftSidebarCollapsed}
          onCollapseChange={handleLeftSidebarToggle}
        />
        <main className="main-content">
          <OrderPage queryResult={queryResult} />
        </main>
        <RightSidebar 
          isCollapsed={rightSidebarCollapsed}
          onCollapseChange={handleRightSidebarToggle}
          onQueryResult={handleQueryResult}
        />
      </div>
    </div>
  )
}

export default App
