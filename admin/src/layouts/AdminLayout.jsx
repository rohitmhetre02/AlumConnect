import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import AdminMobileNav from '../components/admin/AdminMobileNav'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar - Fixed position */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-72 lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="flex-1 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-full bg-white shadow-2xl">
            <AdminSidebar isMobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col pb-20 lg:pb-0 lg:pl-72">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="min-h-full w-full">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
      <AdminMobileNav />
    </div>
  )
}

export default AdminLayout
