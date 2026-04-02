import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import UserSidebar from '../components/user/UserSidebar'
import UserTopbar from '../components/user/UserTopbar'
import UserMobileNav from '../components/user/UserMobileNav'

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // Auto-close mobile sidebar on larger screens
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [sidebarOpen])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
  if (sidebarOpen && isMobile) {
    document.body.style.overflow = 'hidden'   // disable scroll
  } else {
    document.body.style.overflow = 'auto'     // enable scroll
  }

  return () => {
    document.body.style.overflow = 'unset'    // cleanup
  }
}, [sidebarOpen, isMobile])

  return (
    <div className="relative flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar - always visible on desktop */}
      {!isMobile && (
        <div className="fixed inset-y-0 left-0 z-30 w-72 flex">
          <UserSidebar />
        </div>
      )}

      {/* Mobile sidebar overlay - only on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="flex-1 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-full max-w-full bg-white overflow-y-auto">
            <UserSidebar isMobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area with topbar */}
      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0 lg:pl-72">
        {/* Topbar - always visible with menu toggle */}
        <UserTopbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom navigation - only on mobile */}
      <UserMobileNav />
    </div>
  )
}

export default UserLayout
