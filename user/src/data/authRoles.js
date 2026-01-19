export const signupRoles = [
  {
    id: 'student',
    title: 'Sign up as a Student',
    description: 'Apply for mentorships, events, and new opportunities.',
    label: 'Student',
    tone: 'bg-[#FEF7E7] border border-transparent',
    badgeGradient: 'linear-gradient(135deg, #FCE7C8 0%, #F9C77F 100%)',
  },
  {
    id: 'alumni',
    title: 'Sign up as an Alumni',
    description: 'Share expertise, host mentorship circles, and unlock collaborative projects.',
    label: 'Alumni',
    tone: 'bg-[#E8F1FB] border border-transparent',
    badgeGradient: 'linear-gradient(135deg, #D9E8FF 0%, #A4C8FF 100%)',
  },
  {
    id: 'faculty',
    title: 'Sign up as Faculty',
    description: 'Support curriculum, mentor students, and drive campus initiatives.',
    label: 'Faculty',
    tone: 'bg-[#E7F4F1] border border-transparent',
    badgeGradient: 'linear-gradient(135deg, #CFEFE7 0%, #9CD9CB 100%)',
  },
]

export const getSignupRoleById = (roleId) => signupRoles.find((role) => role.id === roleId)
