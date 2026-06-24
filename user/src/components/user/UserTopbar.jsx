import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MessagesPanel from "./MessagesPanel";
import io from 'socket.io-client';
import axios from 'axios';

const UserTopbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [conversationsList, setConversationsList] = useState([]);
  const [messageDropdownOpen, setMessageDropdownOpen] = useState(false);
  const msgDropdownRef = useRef(null);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  // Calculate unread count from actual conversations
  const unreadCount = Object.keys(conversations)
    .filter(key => !key.startsWith('userInfo_'))
    .reduce((total, convId) => {
      const messages = conversations[convId] || [];
      const unreadInConv = messages.filter(m => !m.isRead && m.senderId !== user?.id).length;
      return total + unreadInConv;
    }, 0);

  const totalUnread = conversationsList.reduce((sum, c) => sum + (c.unread || 0), 0);

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Update conversations when Socket.io receives new message
  const updateConversationsWithNewMessage = (message) => {
    setConversations(prev => {
      const updated = { ...prev };
      if (!updated[message.conversationId]) {
        updated[message.conversationId] = [];
      }
      
      // Add message if it doesn't already exist
      const messageExists = updated[message.conversationId].some(m => 
        m._id === message._id || (m.text === message.text && m.timestamp === message.timestamp)
      );
      
      if (!messageExists) {
        updated[message.conversationId].push({
          _id: message._id,
          senderId: message.senderId,
          senderName: message.senderName,
          recipientId: message.recipientId,
          recipientName: message.recipientName,
          text: message.text,
          timestamp: message.timestamp,
          isRead: message.isRead || false,
          createdAt: message.timestamp,
          type: message.type || 'message'
        });
      }
      
      return updated;
    });
  };
  
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showActivityPanel, setShowActivityPanel] = useState(false);

  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  // Debug state changes
  useEffect(() => {
    // isMessagesOpen changed
  }, [isMessagesOpen]);

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

  // Notification Functions
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId || notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Also update backend to persist the change
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(`${import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      
      // Revert local state if backend update fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId || notification._id === notificationId
            ? { ...notification, isRead: false }
            : notification
        )
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Also update backend to persist the change
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(`${import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/notifications/mark-all-read`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert local state if backend update fails
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: false }))
      );
    }
  }, []);

  const handleNotificationClick = useCallback((notification) => {
    // Only mark as read if it's currently unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Always use getRedirectUrl to get the correct current path
    const correctRedirectUrl = getRedirectUrl(notification.type, notification.data);
    
    // Navigate to the correct page
    if (correctRedirectUrl) {
      navigate(correctRedirectUrl);
      setIsNotificationPanelOpen(false);
    }
  }, [markAsRead, navigate]);

  // Fetch real notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping notification fetch');
        return;
      }

      const response = await axios.get(`${import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
    
      
      if (response.data && response.data.notifications) {
        // Ensure each notification has the required fields
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification._id || notification.id || Date.now().toString(),
          _id: notification._id || notification.id,
          message: notification.message || 'No message',
          type: notification.type || 'general',
          isRead: notification.isRead || false,
          redirectUrl: notification.redirectUrl || getRedirectUrl(notification.type, notification.data),
          createdAt: notification.createdAt || new Date().toISOString(),
          data: notification.data || {}
        }));
        
        setNotifications(formattedNotifications);
        
      } else {
        
        setNotifications([]);
      }
    } catch (error) {
      
      // If API fails, set empty array for now
      // In production, you might want to show a retry option
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user?.id]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Socket.io integration for real-time messaging and notifications
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;


    const socket = io(import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
     
      // Join user-specific room for notifications
      if (user?.id) {
        socket.emit('joinUserRoom', user.id);
        
      }
    });

    socket.on('connect_error', (error) => {
      
    });

    // Handle real-time notifications
    socket.on('newNotification', (notification) => {
      
      
      // Add new notification to the list
      setNotifications(prev => [{
        id: notification._id || Date.now().toString(),
        message: notification.message,
        type: notification.type || 'general',
        isRead: false,
        redirectUrl: getRedirectUrl(notification.type, notification.data),
        createdAt: notification.createdAt || new Date().toISOString(),
        ...notification
      }, ...prev]);
    });

    socket.on('notificationRead', (notificationId) => {
      // Mark notification as read in real-time
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId || notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    });

    socket.on('receiveMessage', (message) => {
      
      
      // Update conversations with new message using the helper function
      updateConversationsWithNewMessage(message);
      
      // Also update conversations list for dropdown
      setConversationsList(prev => {
        const updated = prev.map(c =>
          c.conversationId === message.conversationId
            ? { ...c, lastMessage: message.text, time: formatTimeAgo(message.timestamp), unread: message.senderId !== user?.id ? (c.unread || 0) + 1 : c.unread }
            : c
        );
        localStorage.setItem("userConversations", JSON.stringify(updated));
        return updated;
      });
    });

    socket.on('messageRead', (data) => {
     
      
      // Update read status for messages in conversation
      setConversations(prev => {
        const updated = { ...prev };
        const messages = updated[data.conversationId] || [];
        
        updated[data.conversationId] = messages.map(msg => ({
          ...msg,
          isRead: true
        }));
        
        return updated;
      });
    });

    return () => {
      socket.close();
    };
  }, [user]);

  // Fetch conversations list for dropdown
  const fetchConversationsList = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/conversations/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversationsList(data.data);
        localStorage.setItem("userConversations", JSON.stringify(data.data));
      }
    } catch {
      const stored = localStorage.getItem("userConversations");
      if (stored) setConversationsList(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetchConversationsList();
    const interval = setInterval(fetchConversationsList, 30000);
    return () => clearInterval(interval);
  }, [fetchConversationsList]);

  // Close message dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (msgDropdownRef.current && !msgDropdownRef.current.contains(e.target)) {
        setMessageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Get redirect URL based on notification type and user role
  const getRedirectUrl = (type, data) => {
    const userRole = user?.role?.toLowerCase();
    
    switch (type) {
      case 'application':
        if (userRole === 'student') {
          return '/dashboard/applications';
        }
        break;
      case 'mentorship':
        if (userRole === 'student') {
          return '/dashboard/mentorship-requests';
        }
        break;
      case 'connection':
        if (userRole === 'student') {
          return '/dashboard/messages';
        }
        break;
      case 'message':
        return '/dashboard/messages';
      case 'content_approval':
        if (userRole === 'alumni') {
          return '/dashboard/activity/content';
        }
        break;
      case 'event':
        return '/dashboard/activity/content';
      case 'opportunity':
        return '/dashboard/activity/content';
      case 'campaign':
        return '/dashboard/activity/content';
      default:
        return '/dashboard/activity/content';
    }
    
    return '/dashboard/activity/content';
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

  const handleLogout = () => {
    logout();
    setOpenDropdown(null);
  };

  // Format time ago with detailed date/time
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // If less than 1 minute
    if (diffInMinutes < 1) {
      return 'Just now';
    }
    // If less than 1 hour
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    // If less than 24 hours
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    // If less than 7 days
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    // For older notifications, show the actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format full date and time
  const formatFullDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <div className="relative" ref={notificationRef}>
            <IconButton
              label="Notifications"
              badge={unreadNotificationsCount > 0 ? unreadNotificationsCount.toString() : null}
              onClick={() => setIsNotificationPanelOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </IconButton>
          </div>
          <div className="relative" ref={msgDropdownRef}>
            <IconButton
              label="Messages"
              badge={totalUnread > 0 ? totalUnread.toString() : null}
              onClick={() => setMessageDropdownOpen(prev => !prev)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 14a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </IconButton>
            {messageDropdownOpen && (
              <MessageDropdown
                conversations={conversationsList.slice(0, 3)}
                currentUserId={user?.id || user?._id}
                onViewAll={() => { navigate('/dashboard/messages'); setMessageDropdownOpen(false); }}
                onSelectConversation={(convId) => { navigate('/dashboard/messages'); setMessageDropdownOpen(false); }}
                formatTime={formatTimeAgo}
              />
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
                  <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
        onShowList={() => {
          setViewMode("list");
          setActiveConversationId(null);
        }}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        formatTimeAgo={formatTimeAgo}
      />
    </>
  );
};

const IconButton = ({ children, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className="relative grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-slate-50 transition-colors"
    aria-label={label}
  >
    {children}
    {badge && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </button>
);

// Notification Panel Component
const NotificationPanel = ({ isOpen, onClose, notifications, onNotificationClick, onMarkAsRead, onMarkAllAsRead, formatTimeAgo }) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-500">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications yet</h3>
              <p className="text-sm text-slate-500">We'll notify you when something important happens</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick(notification)}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Notification Card Component
const NotificationCard = ({ notification, onClick, onMarkAsRead, formatTimeAgo }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'mentorship':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'connection':
        return (
          <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'content_approval':
        return (
          <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Format full date and time
  const formatFullDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-50' : 'bg-white'
      }`}
      onClick={() => {
        onClick();
        if (!notification.isRead) {
          onMarkAsRead();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">
              {formatTimeAgo(notification.createdAt)}
            </p>
            <span className="text-xs text-slate-400">•</span>
            <p className="text-xs text-slate-400">
              {formatFullDateTime(notification.createdAt)}
            </p>
          </div>
        </div>
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const MessageDropdown = ({ conversations, currentUserId, onViewAll, onSelectConversation, formatTime }) => (
  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-100 bg-white shadow-xl z-50">
    <div className="p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-3">
        <span>Messages</span>
        {conversations.length > 0 && (
          <span className="text-xs text-slate-400">{conversations.length} recent</span>
        )}
      </div>
      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants?.find((p) => p.userId !== currentUserId);
            const name = other?.userName || conv.name || 'User';
            const avatar = other?.userAvatar || conv.avatar || '';
            return (
              <button
                key={conv.conversationId || conv._id}
                onClick={() => onSelectConversation(conv.conversationId)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-slate-50"
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                    <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">{conv.time || formatTime(conv.updatedAt) || ''}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400 py-4">No conversations yet</p>
      )}
    </div>
    {conversations.length > 0 && (
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onViewAll}
          className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-primary transition hover:bg-slate-200"
        >
          View All Messages
        </button>
      </div>
    )}
  </div>
);

export default UserTopbar;