import { Outlet } from 'react-router-dom'
import PublicNavbar from '../components/layout/PublicNavbar'
import PublicFooter from '../components/layout/PublicFooter'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-12 lg:px-8">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}

export default PublicLayout
