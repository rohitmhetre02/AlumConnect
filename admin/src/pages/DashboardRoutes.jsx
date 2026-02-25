import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'

// Dashboard Overview
import DashboardOverview from './DashboardOverview'
import DashboardOverviewEnhanced from './DashboardOverviewEnhancedFixed'

// Admin Dashboard Components
import AdminDashboardHome from '../components/AdminDashboardHome'
import UserManagement from '../components/UserManagement'
import FacultyManagement from '../components/FacultyManagement'
import MentorManagement from '../components/MentorManagement'
import AlumniManagement from '../components/AlumniManagement'
import CoordinatorManagement from '../components/CoordinatorManagement'
import AdminPostEvent from '../components/AdminPostEvent'
import AdminPostOpportunity from '../components/AdminPostOpportunity'
import AdminPostCampaign from '../components/AdminPostCampaign'
import AdminPostArticle from '../components/AdminPostArticle'
import EventsManagement from '../components/EventsManagement'
import EventRegistrations from '../components/EventRegistrations'
import AdminEventDetail from '../components/AdminEventDetail'
import OpportunitiesManagement from '../components/OpportunitiesManagement'
import AdminOpportunityDetail from '../components/AdminOpportunityDetail'
import OpportunityApplicants from '../components/OpportunityApplicants'
import CampaignsManagement from '../components/CampaignsManagement'
import AdminCampaignsManagement from '../components/AdminCampaignsManagement'
import AdminCampaignDetail from '../components/AdminCampaignDetail'
import DonationsManagement from '../components/DonationsManagement'
import NewsManagement from '../components/NewsManagement'
import CoordinatorNewsReview from '../components/CoordinatorNewsReview'
import AdminNewsDetail from '../components/AdminNewsDetail'
import Mentorship from '../components/Mentorship'
import Gallery from '../components/Gallery'
import AdminAnalyticsDashboard from '../components/AdminAnalyticsDashboard'
import Settings from '../components/Settings'
import ProfileApprovalManagement from '../components/ProfileApprovalManagement'
import PostApprovalManagement from '../components/PostApprovalManagement'
import AdminProfile from './AdminProfile'

// Coordinator Dashboard Components
import CoordinatorDashboardHome from '../components/CoordinatorDashboardHome'
import AdminLayout from '../layouts/AdminLayout'
// Coordinator components will be added later

const DashboardRoutes = () => {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route element={<AdminDashboard />}>
        <Route index element={<DashboardOverviewEnhanced />} />
        <Route path="dashboard" element={<DashboardOverviewEnhanced />} />
        <Route path="overview" element={<DashboardOverviewEnhanced />} />
        <Route path="classic" element={<DashboardOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:memberId" element={<UserManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="faculty/:memberId" element={<FacultyManagement />} />
        <Route path="mentors" element={<MentorManagement />} />
        <Route path="alumni" element={<AlumniManagement />} />
        <Route path="alumni/:memberId" element={<AlumniManagement />} />
        <Route path="coordinators" element={<CoordinatorManagement />} />
        <Route path="coordinators/:memberId" element={<CoordinatorManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="events/create" element={<AdminPostEvent />} />
        <Route path="events/:eventId" element={<AdminEventDetail />} />
        <Route path="events/:eventId/edit" element={<AdminPostEvent />} />
        <Route path="events/:eventId/registrations" element={<EventRegistrations />} />
        <Route path="opportunities" element={<OpportunitiesManagement />} />
        <Route path="opportunities/create" element={<AdminPostOpportunity />} />
        <Route path="opportunities/:opportunityId" element={<AdminOpportunityDetail />} />
        <Route path="opportunities/:opportunityId/edit" element={<AdminPostOpportunity />} />
        <Route path="opportunities/:opportunityId/applicants" element={<OpportunityApplicants />} />
        <Route path="campaigns" element={<AdminCampaignsManagement />} />
        <Route path="campaigns/create" element={<AdminPostCampaign />} />
        <Route path="campaigns/:campaignId" element={<AdminCampaignDetail />} />
        <Route path="campaigns/:campaignId/edit" element={<AdminPostCampaign />} />
        <Route path="donations" element={<DonationsManagement />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="news/review" element={<CoordinatorNewsReview />} />
        <Route path="news/create" element={<AdminPostArticle />} />
        <Route path="news/:articleId" element={<AdminNewsDetail />} />
        <Route path="news/:articleId/edit" element={<AdminPostArticle />} />
        <Route path="mentorship" element={<Mentorship />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="analytics" element={<AdminAnalyticsDashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile-approval" element={<ProfileApprovalManagement />} />
        <Route path="profile-approval/pending" element={<ProfileApprovalManagement />} />
        <Route path="profile-approval/approved" element={<ProfileApprovalManagement />} />
        <Route path="post-approval" element={<PostApprovalManagement />} />
        <Route path="post-approval/pending" element={<PostApprovalManagement />} />
        <Route path="post-approval/approved" element={<PostApprovalManagement />} />
        <Route path="coordinator/post-approval" element={<PostApprovalManagement />} />
        <Route path="coordinator/post-approval/pending" element={<PostApprovalManagement />} />
        <Route path="coordinator/post-approval/approved" element={<PostApprovalManagement />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Coordinator Routes - Use same layout as admin */}
      <Route element={<AdminLayout />}>
        <Route index element={<CoordinatorDashboardHome />} />
        <Route path="coordinator/dashboard" element={<CoordinatorDashboardHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:memberId" element={<UserManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="faculty/:memberId" element={<FacultyManagement />} />
        <Route path="mentors" element={<MentorManagement />} />
        <Route path="alumni" element={<AlumniManagement />} />
        <Route path="alumni/:memberId" element={<AlumniManagement />} />
        <Route path="coordinators" element={<CoordinatorManagement />} />
        <Route path="coordinators/:memberId" element={<CoordinatorManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="events/create" element={<AdminPostEvent />} />
        <Route path="events/:eventId" element={<AdminEventDetail />} />
        <Route path="events/:eventId/edit" element={<AdminPostEvent />} />
        <Route path="events/:eventId/registrations" element={<EventRegistrations />} />
        <Route path="opportunities" element={<OpportunitiesManagement />} />
        <Route path="opportunities/create" element={<AdminPostOpportunity />} />
        <Route path="opportunities/:opportunityId" element={<AdminOpportunityDetail />} />
        <Route path="opportunities/:opportunityId/edit" element={<AdminPostOpportunity />} />
        <Route path="opportunities/:opportunityId/applicants" element={<OpportunityApplicants />} />
        <Route path="campaigns" element={<AdminCampaignsManagement />} />
        <Route path="campaigns/create" element={<AdminPostCampaign />} />
        <Route path="campaigns/:campaignId" element={<AdminCampaignDetail />} />
        <Route path="campaigns/:campaignId/edit" element={<AdminPostCampaign />} />
        <Route path="analytics" element={<AdminAnalyticsDashboard />} />
        <Route path="profile-approval" element={<ProfileApprovalManagement />} />
        <Route path="profile-approval/pending" element={<ProfileApprovalManagement />} />
        <Route path="profile-approval/approved" element={<ProfileApprovalManagement />} />
        <Route path="profile" element={<Settings />} />
        <Route path="coordinator/post-approval" element={<PostApprovalManagement />} />
        <Route path="coordinator/post-approval/pending" element={<PostApprovalManagement />} />
        <Route path="coordinator/post-approval/approved" element={<PostApprovalManagement />} />
      </Route>
    </Routes>
  )
}

export default DashboardRoutes
