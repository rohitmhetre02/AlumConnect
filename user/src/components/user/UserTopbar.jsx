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
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md border"
          >
            ☰
          </button>

          <h1 className="font-semibold text-slate-700">
            Welcome, {displayName}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
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
              🔔
            </IconButton>

            {openDropdown === "notifications" && (
              <div className="absolute right-0 mt-3 w-72 bg-white shadow-lg rounded-lg">
                <NotificationDropdown
                  onViewAllActivity={() => {
                    setShowActivityPanel(true);
                    setOpenDropdown(null);
                  }}
                />
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
              💬
            </IconButton>

            {openDropdown === "messages" && (
              <div className="absolute right-0 mt-3 w-72 bg-white shadow-lg rounded-lg">
                <button
                  className="w-full text-left p-3 hover:bg-gray-100"
                  onClick={() => openMessagesPanel()}
                >
                  Open Messages
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