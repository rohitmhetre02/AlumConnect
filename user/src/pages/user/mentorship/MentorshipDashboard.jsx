import { useAuth } from '../../../context/AuthContext'
import { useMentors } from '../../../hooks/useMentors'
import { useMentorRequests } from '../../../hooks/useMentorRequests'
import { useMentorSessions } from '../../../hooks/useMentorSessions'
import MentorPanelDashboard from '../MentorPanelDashboard'

const MentorshipDashboard = () => {
  const { user } = useAuth()
  const { items: mentors } = useMentors()
  const { requests } = useMentorRequests()
  const { sessions } = useMentorSessions()

  return <MentorPanelDashboard />
}

export default MentorshipDashboard
