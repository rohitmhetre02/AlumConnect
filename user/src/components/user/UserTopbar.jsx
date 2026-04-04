import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notifications } from "../../data/notifications";
import NotificationDropdown from "./topbar/NotificationDropdown";

const UserTopbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [unreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showActivityPanel, setShowActivityPanel] = useState(false);

  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const notificationRef = useRef(null);
  const messageRef = useRef(null);

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.email?.split("@")[0] ||
    "";

  const avatarInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : "U";

  // close dropdown if clicked outside
  useEffect(() => {
    const handleClick = (event) => {
      if (
        notificationRef.current?.contains(event.target) ||
        messageRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setOpenDropdown(null);
  };

  const openMessagesPanel = useCallback((conversationId = null) => {
    setIsMessagesOpen(true);
    setOpenDropdown(null);

    if (conversationId) {
      setActiveConversationId(conversationId);
      setViewMode("conversation");
    } else {
      setViewMode("list");
    }
  }, []);

  const closeMessagesPanel = () => {
    setIsMessagesOpen(false);
    setViewMode("list");
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setViewMode("conversation");
  };

  const handleSendMessage = (conversationId, text) => {
    if (!conversationId) return;

    setConversations((prev) => {
      const updated = { ...prev };

      if (!updated[conversationId]) updated[conversationId] = [];

      updated[conversationId].push({
        _id: Date.now(),
        senderId: user?.id,
        body: text,
        createdAt: new Date().toISOString(),
      });

      return updated;
    });
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-3">
        {/* Left - Menu Icon (when sidebar is open) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18m-9-9v12m9 9v12" />
            </svg>
          </button>

          {/* Logo/Brand - hidden on mobile when sidebar is open */}
          <div className="hidden sm:block">
            <div className="flex items-center space-x-3">

              <div>

              </div>
            </div>
          </div>
        </div>

        {/* Spacer for more blank space */}
        <div className="flex-1"></div>

        {/* Right - Professional Icons */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <IconButton
              label="Notifications"
              badge="2"
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === "notifications" ? null : "notifications"
                )
              }
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </IconButton>

            {openDropdown === "notifications" && (
              <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl border border-slate-200 p-6 text-center">

                <div className="h-12 w-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </div>

                <p className="font-semibold text-slate-900">Coming Soon </p>
                <p className="text-sm text-slate-500 mt-1">
                  Notifications feature is under development
                </p>

              </div>
            )}
          </div>

          {/* Messages */}
          <div className="relative" ref={messageRef}>
            <IconButton
              label="Messages"
              badge={unreadCount > 0 ? unreadCount.toString() : null}
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === "messages" ? null : "messages"
                )
              }
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 14a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </IconButton>

            {openDropdown === "messages" && (
              <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl border border-slate-200 p-6 text-center">

                <div className="h-12 w-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="M21 14a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>

                <p className="font-semibold text-slate-900">Coming Soon </p>
                <p className="text-sm text-slate-500 mt-1">
                  Messaging feature is under development
                </p>

              </div>

            )}
          </div>

          {/* Responsive Profile Dropdown - Only visible on mobile */}
          <div className="relative lg:hidden">
            <button
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === "profile" ? null : "profile"
                )
              }
              className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-colors"
              aria-label="Profile menu"
            >
              {user?.avatar || user?.profile?.avatar ? (
                <img
                  src={user?.avatar || user?.profile?.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {avatarInitial}
                  </span>
                </div>
              )}
            </button>

            {openDropdown === "profile" && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl border border-slate-200 py-2 z-50">
                

                {/* Menu Items */}
                <button
                  onClick={() => {
                    navigate('/dashboard/settings');
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages Panel */}
      <MessagesPanel
        isOpen={isMessagesOpen}
        onClose={closeMessagesPanel}
        contacts={[]}
        conversations={conversations}
        activeConversationId={activeConversationId}
        viewMode={viewMode}
        onShowList={() => setViewMode("list")}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
      />

      {/* Activity Panel */}
      <ActivityPanel
        isOpen={showActivityPanel}
        onClose={() => setShowActivityPanel(false)}
      />
    </>
  );
};

const IconButton = ({ children, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className="relative grid h-10 w-10 place-items-center rounded-full border bg-white"
    aria-label={label}
  >
    {children}
    {badge && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const ActivityPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end">
      <div className="bg-white w-96 h-full p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">All Notifications</h2>

        {notifications.map((item) => (
          <div
            key={item.id}
            className="border p-3 rounded mb-3"
          >
            <p className="font-semibold">{item.title}</p>
            <p className="text-xs text-gray-500">{item.time}</p>
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 text-red-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const MessagesPanel = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  viewMode,
  onSelectConversation,
  onSendMessage,
}) => {
  const [draft, setDraft] = useState("");

  if (!isOpen) return null;

  const messages = conversations[activeConversationId] || [];

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage(activeConversationId, draft);
    setDraft("");
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end">
      <div className="bg-white w-96 h-full p-6 flex flex-col">
        <h2 className="font-semibold text-lg mb-4">Messages</h2>

        {viewMode === "conversation" ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((msg) => (
                <div key={msg._id} className="text-sm">
                  {msg.body}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <input
                className="border flex-1 p-2"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-3"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>No conversations yet.</p>
        )}

        <button onClick={onClose} className="mt-4 text-red-500">
          Close
        </button>
      </div>
    </div>
  );
};

export default UserTopbar;