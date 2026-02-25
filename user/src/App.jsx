import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import Mentorship from './pages/Mentorship'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SignupForm from './pages/SignupForm'
import ForgotPassword from './pages/ForgotPassword'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/user/Dashboard'
import UserLayout from './layouts/UserLayout'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/ToastProvider'
import UserDirectory from './pages/user/Directory'
import DirectoryProfile from './pages/user/DirectoryProfile'
import UserMentorship from './pages/user/Mentorship'
import UserProfile from './pages/user/Profile'
import UserNews from './pages/user/News'
import NewsDetail from './pages/user/NewsDetail'
import NewsCreate from './pages/user/NewsCreate'
import EventDetail from './pages/user/EventDetail'
import UserEvents from './pages/user/Events'
import RegisteredEvents from './pages/user/RegisteredEvents'
import Donations from './pages/user/Donations'
import DonationDetail from './pages/user/DonationDetail'
import MyActivity from './pages/user/MyActivity'
import MyApplications from './pages/user/MyApplications'
import ContentPosted from './pages/user/ContentPosted'
import MyPosts from './pages/user/MyPosts'
import EventRegistrations from './pages/user/EventRegistrations'
import MyRequests from './pages/user/MyRequests'
import PostDonationCampaign from './pages/user/PostDonationCampaign'
import Campaigns from './pages/user/Campaigns'
import CampaignDetail from './pages/user/CampaignDetailNew'
import Settings from './pages/user/Settings'
import UserGallery from './pages/user/Gallery'
import StudentsDirectory from './pages/StudentsDirectory'
import AlumniDirectory from './pages/AlumniDirectory'
import FacultyDirectory from './pages/FacultyDirectory'
import CoordinatorsDirectory from './pages/CoordinatorsDirectory'
import Opportunities from './pages/user/Opportunities'
import PostOpportunity from './pages/user/PostOpportunity'
import OpportunityDetail from './pages/user/OpportunityDetail'
import OpportunityApplications from './pages/user/OpportunityApplications'
import PostEvent from './pages/user/PostEvent'
import EditEvent from './pages/user/EditEvent'
import EditDonation from './pages/user/EditDonation'
import EditOpportunity from './pages/user/EditOpportunity'
import UserInsights from './pages/user/UserInsights'
import MentorProfile from './pages/user/MentorProfile'
import ProfileReviewBanner from './components/user/ProfileReviewBanner'
import AccessRestrictedPage from './components/user/AccessRestrictedPage'
import { normalizeProfileStatus, PROFILE_STATUS } from './utils/profileStatus'
import AIMentorMatch from './pages/user/AIMentorMatchClean'
import CoordinatorRegistrationApprovals from './pages/user/CoordinatorRegistrationApprovals'
import AdminRegistrationApprovals from './pages/user/AdminRegistrationApprovals'
import { normalizeRegistrationStatus, REGISTRATION_STATUS } from './utils/registrationStatus'
import BecomeMentor from './pages/user/BecomeMentor'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Allow access to dashboard and profile even if profile is not approved
  // Other routes will be handled by individual route guards
  return children
}

const RedirectIfAuthenticated = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  if (user) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }
  return children
}

// Route guard for when registration or profile is pending approval
const ProfilePendingGuard = ({ children }) => {
  const { user } = useAuth()
  const registrationStatus = normalizeRegistrationStatus(user?.registrationStatus)
  const profileStatus = normalizeProfileStatus(user?.profileApprovalStatus)

  const isNonAdmin = user?.role?.toLowerCase() !== 'admin'
  const isRegistrationBlocked =
    isNonAdmin && registrationStatus !== REGISTRATION_STATUS.APPROVED
  const isProfileBlocked =
    ['student', 'alumni', 'faculty'].includes(user?.role) &&
    (profileStatus === PROFILE_STATUS.IN_REVIEW || profileStatus === PROFILE_STATUS.REJECTED)

  if (isRegistrationBlocked || isProfileBlocked) {
    return <AccessRestrictedPage user={user} />
  }

  return children
}

const ProfilePendingGuardWithFallback = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  const registrationStatus = normalizeRegistrationStatus(user?.registrationStatus)
  const profileStatus = normalizeProfileStatus(user?.profileApprovalStatus)

  const isNonAdmin = user?.role?.toLowerCase() !== 'admin'
  const isRegistrationBlocked =
    isNonAdmin && registrationStatus !== 'APPROVED'
  const isProfileBlocked =
    ['student', 'alumni', 'faculty'].includes(user?.role) &&
    (profileStatus === PROFILE_STATUS.IN_REVIEW || profileStatus === PROFILE_STATUS.REJECTED)

  if (isRegistrationBlocked || isProfileBlocked) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }

  return children
}

const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth()
  const normalizedRole = user?.role?.toLowerCase() ?? ''

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const ComingSoon = ({ title }) => (
  <section className="mx-auto max-w-3xl text-center">
    <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
    <p className="mt-4 text-lg text-slate-500">
      We are crafting this experience. Please check back soon!
    </p>
  </section>
)

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="directory" element={<Navigate to="/dashboard/directory/students" replace />} />
            <Route path="directory/:profileId" element={<DirectoryProfile />} />
            <Route path="events" element={<Events />} />
            <Route path="mentorship" element={<Mentorship />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="gallery/:department" element={<Gallery />} />
            <Route path="gallery/:department/:folder" element={<Gallery />} />
            <Route
              path="login"
              element={
                <RedirectIfAuthenticated>
                  <Login />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="signup"
              element={
                <RedirectIfAuthenticated>
                  <Signup />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="signup/:role"
              element={
                <RedirectIfAuthenticated>
                  <SignupForm />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="forgot-password"
              element={
                <RedirectIfAuthenticated>
                  <ForgotPassword />
                </RedirectIfAuthenticated>
              }
            />
          </Route>
          <Route
            path="dashboard/*"
            element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="directory/students" element={
              <ProfilePendingGuardWithFallback>
                <StudentsDirectory />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="directory/alumni" element={
              <ProfilePendingGuardWithFallback>
                <AlumniDirectory />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="directory/faculty" element={
              <ProfilePendingGuardWithFallback>
                <FacultyDirectory />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="directory/coordinators" element={
              <ProfilePendingGuardWithFallback>
                <CoordinatorsDirectory />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="directory/profile/:profileId" element={
              <ProfilePendingGuardWithFallback>
                <DirectoryProfile />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="mentorship" element={
              <ProfilePendingGuardWithFallback>
                <UserMentorship />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="mentorship/become" element={
              <ProfilePendingGuardWithFallback>
                <BecomeMentor />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="mentorship/ai-match" element={
              <ProfilePendingGuardWithFallback>
                <AIMentorMatch />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="mentorship/:panelSection" element={
              <ProfilePendingGuardWithFallback>
                <UserMentorship />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="mentors/:mentorId" element={
              <ProfilePendingGuardWithFallback>
                <MentorProfile />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="events" element={
              <ProfilePendingGuardWithFallback>
                <UserEvents />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="events/post" element={
              <ProfilePendingGuardWithFallback>
                <PostEvent />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="events/:eventId/edit" element={
              <ProfilePendingGuardWithFallback>
                <EditEvent />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="events/:eventId" element={
              <ProfilePendingGuardWithFallback>
                <EventDetail />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="donations" element={
              <Navigate to="/campaigns" replace />
            } />
            <Route path="donations/create" element={
              <Navigate to="/campaigns/create" replace />
            } />
            <Route path="donations/:campaignId/edit" element={
              <Navigate to="/campaigns/:campaignId/edit" replace />
            } />
            <Route path="donations/:campaignId" element={
              <Navigate to="/campaigns/:campaignId" replace />
            } />
            <Route path="campaigns" element={
              <ProfilePendingGuardWithFallback>
                <Campaigns />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="campaigns/create" element={
              <ProfilePendingGuardWithFallback>
                <PostDonationCampaign />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="campaigns/:campaignId" element={
              <ProfilePendingGuardWithFallback>
                <CampaignDetail />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="opportunities" element={
              <ProfilePendingGuardWithFallback>
                <Opportunities />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="opportunities/post" element={
              <ProfilePendingGuardWithFallback>
                <PostOpportunity />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="registrations/coordinator" element={
              <RoleRoute allowedRoles={['coordinator']}>
                <ProfilePendingGuard>
                  <CoordinatorRegistrationApprovals />
                </ProfilePendingGuard>
              </RoleRoute>
            } />
            <Route path="admin/registration-approvals" element={
              <RoleRoute allowedRoles={['admin']}>
                <ProfilePendingGuard>
                  <AdminRegistrationApprovals />
                </ProfilePendingGuard>
              </RoleRoute>
            } />
            <Route path="jobs" element={
              <ProfilePendingGuardWithFallback>
                <Opportunities filter="job" />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="internships" element={
              <ProfilePendingGuardWithFallback>
                <Opportunities filter="internship" />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="opportunities/:opportunityId/edit" element={
              <ProfilePendingGuardWithFallback>
                <EditOpportunity />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="opportunities/:opportunityId" element={
              <ProfilePendingGuardWithFallback>
                <OpportunityDetail />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="opportunities/:opportunityId/applications" element={
              <ProfilePendingGuardWithFallback>
                <OpportunityApplications />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="donations/:campaignId/edit" element={
              <ProfilePendingGuardWithFallback>
                <EditDonation />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="donations/:campaignId" element={
              <ProfilePendingGuardWithFallback>
                <DonationDetail />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="news" element={
              <ProfilePendingGuardWithFallback>
                <UserNews />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="news/create" element={
              <ProfilePendingGuardWithFallback>
                <NewsCreate />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="news/:articleId" element={
              <ProfilePendingGuardWithFallback>
                <NewsDetail />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="gallery" element={
              <ProfilePendingGuardWithFallback>
                <UserGallery />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="gallery/:department" element={
              <ProfilePendingGuardWithFallback>
                <UserGallery />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="gallery/:department/:folder" element={
              <ProfilePendingGuardWithFallback>
                <UserGallery />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="insights" element={
              <ProfilePendingGuardWithFallback>
                <UserInsights />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="applications" element={
              <ProfilePendingGuardWithFallback>
                <MyApplications />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="mentorship-requests" element={
              <ProfilePendingGuardWithFallback>
                <MyRequests />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="activity/content" element={
              <ProfilePendingGuardWithFallback>
                <ContentPosted />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="my-posts" element={
              <ProfilePendingGuardWithFallback>
                <MyPosts />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="events/:eventId/registrations" element={
              <ProfilePendingGuardWithFallback>
                <EventRegistrations />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="registered-events" element={
              <ProfilePendingGuardWithFallback>
                <RegisteredEvents />
              </ProfilePendingGuardWithFallback>
            } />
            <Route path="settings" element={
              <ProfilePendingGuardWithFallback>
                <Settings />
              </ProfilePendingGuardWithFallback>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
