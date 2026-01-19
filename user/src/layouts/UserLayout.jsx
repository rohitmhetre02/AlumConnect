import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import UserSidebar from '../components/user/UserSidebar'
import UserTopbar from '../components/user/UserTopbar'
import UserMobileNav from '../components/user/UserMobileNav'

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:flex">
          <UserSidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="flex-1 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-full bg-white shadow-2xl">
            <UserSidebar isMobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0 lg:pl-72">
        <UserTopbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          {children ?? <Outlet />}
        </main>
      </div>
      <UserMobileNav />
    </div>
  )
}

export default UserLayout
