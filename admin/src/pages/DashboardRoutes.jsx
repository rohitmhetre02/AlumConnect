import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'

// Admin Dashboard Components
import AdminDashboardHome from '../components/AdminDashboardHome'
import UserManagement from '../components/UserManagement'
import FacultyManagement from '../components/FacultyManagement'
import MentorManagement from '../components/MentorManagement'
import AlumniManagement from '../components/AlumniManagement'
import AdminPostEvent from '../components/AdminPostEvent'
import AdminPostOpportunity from '../components/AdminPostOpportunity'
import AdminPostCampaign from '../components/AdminPostCampaign'
import AdminPostArticle from '../components/AdminPostArticle'
import EventsManagement from '../components/EventsManagement'
import AdminEventDetail from '../components/AdminEventDetail'
import OpportunitiesManagement from '../components/OpportunitiesManagement'
import AdminOpportunityDetail from '../components/AdminOpportunityDetail'
import CampaignsManagement from '../components/CampaignsManagement'
import AdminCampaignDetail from '../components/AdminCampaignDetail'
import DonationsManagement from '../components/DonationsManagement'
import NewsManagement from '../components/NewsManagement'
import AdminNewsDetail from '../components/AdminNewsDetail'
import Mentorship from '../components/Mentorship'
import Gallery from '../components/Gallery'
import Analytics from '../components/Analytics'
import Settings from '../components/Settings'
import ProfileApprovalManagement from '../components/ProfileApprovalManagement'

// Coordinator Dashboard Components
import CoordinatorDashboardHome from '../components/CoordinatorDashboardHome'
import CoordinatorLayout from '../layouts/CoordinatorLayout'
// Coordinator components will be added later

const DashboardRoutes = () => {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route element={<AdminDashboard />}>
        <Route index element={<AdminDashboardHome />} />
        <Route path="dashboard" element={<AdminDashboardHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:memberId" element={<UserManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="faculty/:memberId" element={<FacultyManagement />} />
        <Route path="mentors" element={<MentorManagement />} />
        <Route path="alumni" element={<AlumniManagement />} />
        <Route path="alumni/:memberId" element={<AlumniManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="events/create" element={<AdminPostEvent />} />
        <Route path="events/:eventId" element={<AdminEventDetail />} />
        <Route path="opportunities" element={<OpportunitiesManagement />} />
        <Route path="opportunities/create" element={<AdminPostOpportunity />} />
        <Route path="opportunities/:opportunityId" element={<AdminOpportunityDetail />} />
        <Route path="campaigns" element={<CampaignsManagement />} />
        <Route path="campaigns/create" element={<AdminPostCampaign />} />
        <Route path="campaigns/:campaignId" element={<AdminCampaignDetail />} />
        <Route path="donations" element={<DonationsManagement />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="news/create" element={<AdminPostArticle />} />
        <Route path="news/:articleId" element={<AdminNewsDetail />} />
        <Route path="mentorship" element={<Mentorship />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile-approval" element={<ProfileApprovalManagement />} />
      </Route>

      {/* Coordinator Routes - Coming Soon */}
      <Route path="coordinator" element={<CoordinatorLayout />}>
        <Route index element={<CoordinatorDashboardHome />} />
        <Route path="dashboard" element={<CoordinatorDashboardHome />} />
        <Route path="students" element={<UserManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="mentors" element={<MentorManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="opportunities" element={<OpportunitiesManagement />} />
        <Route path="campaigns" element={<CampaignsManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default DashboardRoutes
