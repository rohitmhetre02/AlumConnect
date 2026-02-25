import { useRef } from 'react'

import Avatar from '../../ui/Avatar'

import { useAuth } from '../../../context/AuthContext'

import useModal from '../../../hooks/useModal'

import useMessages from '../../../hooks/useMessages'

import ChatModal from '../directory/ChatModal'



const ProfileHeader = ({ profile = {}, onEditSection, showConnectButtons = false }) => {

  const { user } = useAuth()

  const { getConversationWith, joinConversation } = useMessages()

  const chatModal = useModal(false)

  const conversationIdRef = useRef(null)



  const { name, title, location, avatar, cover, raw } = profile

  const targetId = raw?._id ?? profile?._id ?? profile?.id

  const targetRole = raw?.role ?? profile?.role

  const formattedRole = targetRole ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1) : null

  const displayTitle = title?.trim() || formattedRole || 'Student'

  const department = raw?.department || profile.department || ''

  const role = formattedRole || 'Student'

  const currentYear = raw?.currentYear || profile.currentYear || ''

  const passoutYear = raw?.passoutYear || profile.passoutYear || ''

  const isStudent = role.toLowerCase() === 'student'

  const isAlumni = role.toLowerCase() === 'alumni'



  const handleMessageClick = async () => {

    if (!user || !targetId || !targetRole) return

    try {

      const conversation = await getConversationWith({ recipientId: targetId, recipientRole: targetRole })

      if (conversation?._id) {

        conversationIdRef.current = conversation._id

        joinConversation(conversation._id)

      } else {

        conversationIdRef.current = null

      }

      chatModal.openModal()

    } catch (err) {

      console.error('Failed to start conversation:', err)

    }

  }



  const handleViewAllMessages = (conversationId) => {

    chatModal.closeModal()

    const targetConversation = conversationId ?? conversationIdRef.current ?? null

    window.dispatchEvent(

      new CustomEvent('app:openMessagesPanel', {

        detail: { conversationId: targetConversation },

      })

    )

  }



  return (

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">

      <div className="relative h-52 bg-slate-200 sm:h-56">

        {cover ? (

          <img src={cover} alt="Profile cover" className="absolute inset-0 h-full w-full object-cover" />

        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-20 /80" />

        {onEditSection ? (

          <button

            type="button"

            onClick={() => onEditSection('cover')}

            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow ring-1 ring-white/70 backdrop-blur transition-colors hover:text-primary"

          >

            Change Cover

          </button>

        ) : null}

      </div>



      <div className="px-5 pb-6 pt-2 sm:px-8 sm:pb-8">

        <div className="relative -mt-10 flex flex-wrap items-end gap-4 sm:-mt-12 sm:gap-6">

          <div className="rounded-full border-2 border-white ">

            <Avatar src={avatar} name={name} size="xl" />

          </div>

          <div className="flex min-w-[220px]  flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="space-y-1">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{name || 'Alumni Name'}</h1>

              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

                {department && <span>{department}</span>}

                {department && role && <span>•</span>}

                {role && <span>{role}</span>}

                {isStudent && currentYear && (

                  <>

                    {role && <span>•</span>}

                    <span>Year {currentYear}</span>

                  </>

                )}

                {isAlumni && passoutYear && (

                  <>

                    {role && <span>•</span>}

                    <span>Class of {passoutYear}</span>

                  </>

                )}

              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">

                {location ? (

                  <span className="inline-flex items-center gap-1 text-slate-500">

                    <LocationIcon className="h-4 w-4" />

                    {location}

                  </span>

                ) : null}

              </div>

            </div>

            <div className="flex items-center gap-2">

              {showConnectButtons && (

                <>

                  <button

                    type="button"

                    className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary shadow transition hover:bg-primary hover:text-white"

                  >

                    Connect

                  </button>

                  <button

                    type="button"

                    onClick={handleMessageClick}

                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow transition hover:bg-primary-dark"

                  >

                    Message

                  </button>

                </>

              )}

              {onEditSection && (

                <button

                  type="button"

                  onClick={() => onEditSection('summary')}

                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow transition hover:bg-primary-dark"

                >

                  Edit Profile Info

                </button>

              )}

            </div>

          </div>

        </div>

      </div>



      <ChatModal

        isOpen={chatModal.isOpen}

        onClose={chatModal.closeModal}

        recipient={{ _id: targetId, role: targetRole, name }}

        onViewAllMessages={handleViewAllMessages}

      />

    </section>

  )

}



const LocationIcon = (props) => (

  <svg

    viewBox="0 0 24 24"

    fill="none"

    stroke="currentColor"

    strokeWidth="1.8"

    strokeLinecap="round"

    strokeLinejoin="round"

    {...props}

  >

    <path d="M21 10c0 5.5-9 13-9 13S3 15.5 3 10a9 9 0 1118 0z" />

    <circle cx="12" cy="10" r="3" />

  </svg>

)



export default ProfileHeader

