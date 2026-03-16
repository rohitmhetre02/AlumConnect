import { Outlet } from 'react-router-dom'
import CoordinatorLayout from '../layouts/CoordinatorLayout'

const CoordinatorDashboard = () => {
  return (
    <CoordinatorLayout>
      <Outlet />
    </CoordinatorLayout>
  )
}

export default CoordinatorDashboard
