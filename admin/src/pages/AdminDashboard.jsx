import { Outlet } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export default AdminDashboard
