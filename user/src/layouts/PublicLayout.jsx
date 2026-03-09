import { Outlet } from 'react-router-dom'
import PublicNavbar from '../components/layout/PublicNavbar'
import PublicFooter from '../components/layout/PublicFooter'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <main>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}

export default PublicLayout
