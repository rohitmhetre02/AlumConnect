import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter, 
  X, 
  Check, 
  CheckCheck,
  Phone,
  Video,
  Paperclip,
  Smile
} from "lucide-react";
import io from 'socket.io-client';

const Connections = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("messages");
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all");
  const [messages, setMessages] = useState({}); // Store messages per conversation
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Add data status state
  const [dataStatus, setDataStatus] = useState({
    isSaving: false,
    isFetching: false,
    lastSaved: null,
    lastFetched: null,
    totalMessages: 0,
    dbConnected: false
  });

  // Update data status when messages change
  useEffect(() => {
    const totalMessages = Object.values(messages).reduce((sum, msgs) => sum + msgs.length, 0);
    setDataStatus(prev => ({
      ...prev,
      totalMessages,
      dbConnected: isConnected
    }));
  }, [messages, isConnected]);

  const isCoordinator = user?.role === "coordinator";

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling']
    });

    // Clean up existing listeners before adding new ones
    newSocket.off('connect');
    newSocket.off('disconnect');
    newSocket.off('receiveMessage');
    newSocket.off('newConversation');
    newSocket.off('messagesUpdated');
    newSocket.off('testConnectionResponse');

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server with ID:', newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
      toast.success('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
      toast.error('Disconnected from chat server');
    });

    newSocket.on('receiveMessage', (data) => {
      console.log('📨 [Frontend] Received message:', data);
      console.log('📨 [Frontend] Current user ID:', user?.id);
      console.log('📨 [Frontend] Message sender ID:', data.senderId);
      
      // Skip if message is from current user (to prevent duplicates)
      if (String(data.senderId) === String(user?.id)) {
        console.log('🔄 [Frontend] Skipping own message from server to prevent duplicates');
        return;
      }
      
      // Add message to correct conversation
      setMessages(prev => {
        const conversationMessages = prev[data.conversationId] || [];
        
        // Check if message already exists (using _id from database)
        const messageExists = conversationMessages.some(msg => 
          msg._id === data._id || 
          (msg.id === data.id) ||
          (msg.text === data.text && Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000)
        );
        
        if (messageExists) {
          console.log('🔄 [Frontend] Message already exists, skipping:', data._id);
          return prev;
        }
        
        const updated = {
          ...prev,
          [data.conversationId]: [...conversationMessages, {
            ...data,
            type: 'received',
            id: data._id || data.id || `${data.timestamp}_${data.text}`
          }]
        };
        console.log('📝 [Frontend] Updated messages state:', updated);
        return updated;
      });
      
      // Update conversation's last message and unread count
      setConversations(prev => {
        // Find existing conversation
        const existing = prev.find(c => c.conversationId === data.conversationId);
        
        const updatedConv = {
          ...existing,
          id: data.senderId,
          name: data.senderName,
          conversationId: data.conversationId,
          lastMessage: data.text,
          time: formatTime(data.timestamp),
          unread: (existing?.unread || 0) + 1,
          avatar: existing?.avatar || `https://i.pravatar.cc/150?img=${data.senderId.slice(-2)}`,
          role: data.senderRole || 'User'
        };
        
        // Remove old conversation and add updated one at the top
        const filtered = prev.filter(c => c.conversationId !== data.conversationId);
        const updated = [updatedConv, ...filtered];
        
        localStorage.setItem('conversations', JSON.stringify(updated));
        console.log('📝 [Frontend] Updated conversations:', updated);
        return updated;
      });

      // Show notification for received messages
      toast.success(`New message from ${data.senderName}`);
    });

    newSocket.on('newConversation', (data) => {
      console.log('💬 New conversation:', data);
      setConversations(prev => {
        // Remove existing conversation of same user (to prevent duplicates)
        const filtered = prev.filter(c => c.id !== data.id);
        
        // Add new conversation to the beginning
        const updated = [data, ...filtered];
        
        localStorage.setItem('conversations', JSON.stringify(updated));
        return updated;
      });
    });

    newSocket.on('testConnectionResponse', (data) => {
      console.log('🧪 [Frontend] Test connection response:', data);
    });

    newSocket.on('messagesUpdated', (data) => {
      console.log('📝 [Frontend] Messages updated:', data);
      // Update messages with new read status
      setMessages(prev => ({
        ...prev,
        [data.conversationId]: data.messages
      }));
    });

    // Load data from API and localStorage
    const loadData = async () => {
      try {
        // Load connection requests
        const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const requestsData = await requestsResponse.json()
        console.log('📋 [Frontend] Connection requests loaded:', requestsData)
        setConnectionRequests(requestsData.data || [])
        
        // Load connections (for Connections tab)
        const connectionsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/connections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const connectionsData = await connectionsResponse.json()
        console.log('🤝 [Frontend] Connections loaded:', connectionsData)
        setConnections(connectionsData.data || [])
        
        // Load conversations from localStorage and merge with connections
        const storedConversations = localStorage.getItem('conversations');
        if (storedConversations) {
          const parsed = JSON.parse(storedConversations);
          console.log('💾 [Frontend] Loaded conversations from localStorage:', parsed);
          
          // Merge localStorage conversations with connections data
          const mergedConversations = parsed.map(conv => {
            const connectionData = connectionsData.data?.find(conn => conn.id === conv.id);
            return {
              ...conv,
              ...connectionData,
              // Ensure we have all required fields
              name: conv.name || connectionData?.name || 'Unknown User',
              avatar: conv.avatar || connectionData?.avatar || `https://i.pravatar.cc/150?img=${conv.id?.slice(-2)}`,
              role: conv.role || connectionData?.role || 'User'
            };
          });
          
          console.log('🔄 [Frontend] Merged conversations:', mergedConversations);
          setConversations(mergedConversations);
        } else {
          console.log('📝 No stored conversations found, creating from connections');
          
          // Create conversations from connections data if no localStorage data
          const conversationsFromConnections = connectionsData.data?.map(conn => ({
            id: conn.id,
            name: conn.name,
            conversationId: `conv_${user?.id}_${conn.id}_${Date.now()}`,
            lastMessage: 'No messages yet',
            time: 'Just now',
            unread: 0,
            avatar: conn.avatar || `https://i.pravatar.cc/150?img=${conn.id?.slice(-2)}`,
            role: conn.role || 'User'
          })) || [];
          
          setConversations(conversationsFromConnections);
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        // Start with empty state on error
        setConversations([]);
        setMessages({});
      }
    }

    loadData();

    return () => {
      newSocket.close();
    };
  }, [user?.id]); // Only depend on user ID to prevent duplicate calls

  // Format time helper
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // If less than 1 minute ago
    if (diff < 60000) return 'Just now';
    
    // If less than 1 hour ago
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    
    // If less than 24 hours ago
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    
    // If less than 7 days ago, show day name
    if (diff < 604800000) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()] + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + 
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle userId parameter to start conversation
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      // Get user info from navigation state
      const state = location.state;
      
      console.log('🔄 [Frontend] Creating conversation for user:', userId);
      console.log('🔄 [Frontend] User state:', state);
      
      // Create conversation via API
      const createConversation = async () => {
        try {
          const requestData = {
            userId: userId,
            userName: state?.userName || `User ${userId}`,
            userAvatar: state?.userAvatar || `https://i.pravatar.cc/150?img=${userId.slice(-2)}`,
            userRole: state?.userRole || 'User',
            userDepartment: state?.userDepartment || ''
          };
          
          console.log('🔄 [Frontend] Sending request data:', requestData);
          console.log('🔄 [Frontend] Current user info:', user);
          
          const response = await fetch('http://localhost:5000/api/conversations/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(requestData)
          });
          
          console.log('🔄 [Frontend] Response status:', response.status);
          console.log('🔄 [Frontend] Response ok:', response.ok);
          
          const data = await response.json();
          console.log('🔄 [Frontend] Response data:', data);
          
          if (data.success) {
            console.log('💬 [Frontend] Created conversation via API:', data.data);
            
            // Check if conversation already exists and replace instead of merge
            setConversations(prev => {
              // Remove existing conversation of same user (to prevent duplicates)
              const filtered = prev.filter(c => c.id !== userId);
              
              // Add new conversation to the beginning
              const updated = [data.data, ...filtered];
              
              // Save to localStorage
              localStorage.setItem('conversations', JSON.stringify(updated));
              return updated;
            });
            
            // Select the conversation
            setSelectedConversation(data.data);
            
            // Initialize empty messages for this conversation
            setMessages(prev => ({
              ...prev,
              [data.data.conversationId]: []
            }));
            
            // Join the conversation room
            if (socket) {
              console.log('🔄 [Frontend] Joining conversation room:', data.data.conversationId);
              socket.emit('joinConversation', data.data.conversationId);
              
              // Wait a bit for the room to be joined, then emit a test message
              setTimeout(() => {
                console.log('🔄 [Frontend] Testing connection for room:', data.data.conversationId);
                socket.emit('testConnection', { conversationId: data.data.conversationId });
              }, 500);
            }
            
            // Switch to messages tab
            setActiveTab('messages');
            
            toast.success('Conversation created successfully!');
          } else {
            console.error('❌ [Frontend] API error:', data.message);
            toast.error(data.message || 'Failed to create conversation');
          }
        } catch (error) {
          console.error('❌ [Frontend] Network error:', error);
          console.error('❌ [Frontend] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          toast.error('Network error: ' + error.message);
        }
      };
      
      createConversation();
      
      // Clear URL parameter
      navigate('/dashboard/connections', { replace: true });
    }
  }, [searchParams, navigate, location.state, socket]);

  const handleAcceptConnection = async (requestId) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/accept-connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ requestId }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Connection accepted");

      const acceptedUser = connectionRequests.find(
        (r) => r.id === requestId
      );

      setConnectionRequests((prev) =>
        prev.filter((req) => req.id !== requestId)
      );

      const connectionUser = {
        id: acceptedUser?.fromUserId || requestId,
        name: acceptedUser?.fromUserName || 'User',
        role: acceptedUser?.toRole || 'User',
        department: 'Computer Science',
        avatar: acceptedUser?.fromUserAvatar || 'https://i.pravatar.cc/150?img=1'
      };

      setConnections((prev) => [...prev, connectionUser]);
    } else {
      toast.error(data.message || "Failed");
    }
  } catch {
    toast.error("Error accepting request");
  }
};


  // Fetch messages from database
  const fetchMessages = async (conversationId) => {
    try {
      console.log('📨 [Frontend] Fetching messages from database:', conversationId);
      setDataStatus(prev => ({ ...prev, isFetching: true }));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ [Frontend] Messages loaded from database:', data.data.length);
        console.log('📊 [Frontend] Message data:', data.data);
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: data.data
        }));
        
        setDataStatus(prev => ({
          ...prev,
          isFetching: false,
          lastFetched: new Date(),
          dbConnected: true
        }));
      } else {
        console.error('❌ [Frontend] Failed to load messages:', data.message);
        setDataStatus(prev => ({ ...prev, isFetching: false, dbConnected: false }));
      }
    } catch (error) {
      console.error('❌ [Frontend] Error fetching messages:', error);
      setDataStatus(prev => ({ ...prev, isFetching: false, dbConnected: false }));
    }
  };

  const handleSelectConversation = async (conversation) => {
    console.log('🔄 [Frontend] Selecting conversation:', conversation);
    setSelectedConversation(conversation);

    // Load messages for this conversation from database
    try {
      // First, check if we already have messages in state
      if (messages[conversation.conversationId] && messages[conversation.conversationId].length > 0) {
        console.log('📨 [Frontend] Using existing messages from state:', messages[conversation.conversationId]);
      } else {
        console.log('📨 [Frontend] No existing messages, fetching from database');
        
        // Fetch messages from database
        await fetchMessages(conversation.conversationId);
        
        // Join the conversation room to receive real-time messages
        if (socket) {
          console.log('🔌 [Frontend] Joining conversation room:', conversation.conversationId);
          socket.emit('joinConversation', conversation.conversationId);
        }
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }

    // Mark messages as read when selecting conversation
    if (socket) {
      socket.emit('markMessagesAsRead', { conversationId: conversation.conversationId });
    }

    // Reset unread count for this conversation
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv.conversationId === conversation.conversationId ? { ...conv, unread: 0 } : conv
      );
      
      // Save to localStorage
      localStorage.setItem('conversations', JSON.stringify(updated));
      return updated;
    });
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || !socket) return;

    const messageData = {
      conversationId: selectedConversation.conversationId,
      senderId: user?.id,
      senderName:
        user?.name || `${user?.firstName || ""} ${user?.lastName || ""}` || "You",
      recipientId: selectedConversation.id,
      recipientName: selectedConversation.name,
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // ✅ unique ID for optimistic UI
    const messageId =
      Date.now().toString() + "_" + Math.random().toString(36).slice(2);

    const newMessage = {
      ...messageData,
      _id: messageId, // Use _id for database consistency
      id: messageId,  // Keep id for frontend compatibility
      type: "sent",
      isRead: false,
    };

    // ✅ Optimistic UI - Add locally immediately
    setMessages((prev) => {
      const current = prev[selectedConversation.conversationId] || [];
      if (current.some((m) => m._id === messageId)) return prev;
      return {
        ...prev,
        [selectedConversation.conversationId]: [...current, newMessage],
      };
    });

    // ✅ Update conversation (ONE CARD PER USER)
    setConversations((prev) => {
      const filtered = prev.filter(
  (c) => c.conversationId !== selectedConversation.conversationId
);
      const updatedConv = {
        ...selectedConversation,
        lastMessage: message.trim(),
        time: "Just now",
      };
      const updated = [updatedConv, ...filtered];
      console.log('📝 [Frontend] Conversation updated with new message:', updatedConv);
      localStorage.setItem("conversations", JSON.stringify(updated));
      return updated;
    });

    try {
      // ✅ Save to database
      console.log('💾 [Frontend] Saving message to database:', messageData);
      setDataStatus(prev => ({ ...prev, isSaving: true }));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ [Frontend] Message saved to database with ID:', data.data._id);
        console.log('✅ [Frontend] Message data saved:', data.data);
        
        setDataStatus(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          dbConnected: true
        }));
        
        // Update the message with the database _id
        setMessages((prev) => {
          const current = prev[selectedConversation.conversationId] || [];
          const updated = current.map((m) => 
            m.id === messageId ? { ...m, _id: data.data._id } : m
          );
          return {
            ...prev,
            [selectedConversation.conversationId]: updated,
          };
        });
      } else {
        console.error('❌ [Frontend] Failed to save message:', data.message);
        setDataStatus(prev => ({ ...prev, isSaving: false, dbConnected: false }));
        toast.error('Failed to save message');
      }
    } catch (error) {
      console.error('❌ [Frontend] Error saving message:', error);
      setDataStatus(prev => ({ ...prev, isSaving: false, dbConnected: false }));
      toast.error('Failed to save message');
    }

    // ✅ Send via socket for real-time delivery
    socket.emit("sendMessage", messageData);
    console.log('📤 [Frontend] Message sent via socket');

    setMessage("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (selectedConversation && messages[selectedConversation.conversationId]) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, selectedConversation]);

  // Filter connection requests based on selected filter
  const getFilteredRequests = () => {
    if (requestFilter === "all") return connectionRequests;
    if (requestFilter === "sent") return connectionRequests.filter(req => req.fromUserId === user?.id);
    if (requestFilter === "received") return connectionRequests.filter(req => req.toUserId === user?.id);
    return connectionRequests;
  };

  const filteredRequests = getFilteredRequests();
  const sentCount = connectionRequests.filter(req => req.fromUserId === user?.id).length;
  const receivedCount = connectionRequests.filter(req => req.toUserId === user?.id).length;

  return (
  <div className="min-h-screen bg-slate-50 py-8">
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Connections</h1>

      <div className="bg-white rounded-xl shadow border">
        {/* TABS */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 py-3 ${
              activeTab === "messages"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Messages
          </button>

          <button
            onClick={() => setActiveTab("connections")}
            className={`flex-1 py-3 ${
              activeTab === "connections"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Connections
          </button>
        </div>

        {/* MESSAGES */}
        {activeTab === "messages" && (
          <div className="flex h-[500px]">

            {/* LEFT */}
            <div className="w-1/3 border-r overflow-y-auto bg-gray-50">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Conversations</h3>

                {conversations.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-xs mt-2">Start chatting to see conversations here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Conversations Header */}
                    <div className="flex items-center justify-between mb-3 p-2">
                      <span className="text-xs font-medium text-gray-600">
                        {conversations.length} conversations
                      </span>
                      <span className="text-xs text-gray-500">
                        🗄️ DB Synced
                      </span>
                    </div>
                    
                    {/* Debug: Log all data */}
                    {console.log('🔍 [Frontend] Total conversations in state:', conversations.length)}
                    {console.log('🔍 [Frontend] All conversations:', conversations.map(c => ({ 
  id: c.id, 
  name: c.name, 
  messages: messages[c.conversationId]?.length || 0 
})))}
                    {console.log('🔍 [Frontend] Messages state keys:', Object.keys(messages))}
                    {console.log('🔍 [Frontend] Current user ID:', user?.id)}
                    
                    {/* Show ALL conversations - don't filter out current user */}
                    {conversations.map((conv) => {
                      const isActive =
                        selectedConversation?.conversationId === conv.conversationId;
                      const messageCount = messages[conv.conversationId]?.length || 0;

                      console.log('🔍 [Frontend] Rendering card for:', conv.name, 'ID:', conv.id, 'Messages:', messageCount);

                      return (
                        <div
                          key={conv.conversationId}
                          onClick={() => handleSelectConversation(conv)}
                          className={`bg-white rounded-lg p-3 cursor-pointer border transition-all hover:shadow-md ${
                            isActive
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                                {conv.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              {isConnected && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {conv.name}
                                </h4>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {conv.time}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 truncate">
                                  {conv.lastMessage || 'No messages yet'}
                                </p>
                                {conv.unread > 0 && (
                                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
                                    {conv.unread}
                                  </span>
                                )}
                              </div>
                              
                              {/* Data Info */}
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span>💬 {messageCount}</span>
                                <span>📁 {conv.conversationId?.slice(-6) || 'N/A'}</span>
                                {messageCount > 0 && (
                                  <span className="text-green-600">🗄️</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* HEADER */}
                  <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {selectedConversation.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                        <p className="text-xs text-gray-500">
                          {isConnected ? '🟢 Active now' : '🔴 Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone size={18} className="text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Video size={18} className="text-gray-600" />
                      </button>
                      <button 
                        onClick={() => setSelectedConversation(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* MESSAGES */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                    {/* Data Status Panel */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">📊 Data Status</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dataStatus.dbConnected 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dataStatus.dbConnected ? '🟢 DB Connected' : '🔴 DB Disconnected'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Messages:</span>
                            <span className="font-medium text-gray-800">{dataStatus.totalMessages}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Current Conv:</span>
                            <span className="font-medium text-gray-800">
                              {messages[selectedConversation.conversationId]?.length || 0}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Saved:</span>
                            <span className="font-medium text-gray-800">
                              {dataStatus.lastSaved 
                                ? new Date(dataStatus.lastSaved).toLocaleTimeString()
                                : 'Never'
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Fetched:</span>
                            <span className="font-medium text-gray-800">
                              {dataStatus.lastFetched 
                                ? new Date(dataStatus.lastFetched).toLocaleTimeString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Indicators */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-200">
                        {dataStatus.isSaving && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            Saving...
                          </span>
                        )}
                        {dataStatus.isFetching && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                            Fetching...
                          </span>
                        )}
                        {!dataStatus.isSaving && !dataStatus.isFetching && dataStatus.dbConnected && (
                          <span className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            Synced
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Info Header */}
                    <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-blue-600 font-medium">
                            💬 {messages[selectedConversation.conversationId]?.length || 0} messages
                          </span>
                          <span className="text-gray-600">
                            📁 Conv: {selectedConversation.conversationId?.slice(-8) || 'N/A'}
                          </span>
                        </div>
                        <span className="text-gray-500">
                          🗄️ {dataStatus.dbConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>

                    {(messages[selectedConversation.conversationId] || []).map(
                      (msg, index) => {
                        const isSent =
                          String(msg.senderId) === String(user?.id);
                        const showDate = index === 0 || 
                          new Date(msg.timestamp).toDateString() !== 
                          new Date(messages[selectedConversation.conversationId][index - 1]?.timestamp).toDateString();

                        return (
                          <div key={msg._id || msg.id}>
                            {/* Date Separator */}
                            {showDate && (
                              <div className="flex items-center justify-center my-4">
                                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                  {new Date(msg.timestamp).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            )}
                            
                            <div
                              className={`flex mb-4 ${
                                isSent ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div className={`max-w-xs lg:max-w-md ${isSent ? "order-2" : "order-1"}`}>
                                {/* Sender Info for Received Messages */}
                                {!isSent && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                                      {msg.senderName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium">
                                      {msg.senderName}
                                    </span>
                                  </div>
                                )}
                                
                                <div
                                  className={`relative px-4 py-2 rounded-2xl shadow-sm ${
                                    isSent
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed break-words">
                                    {msg.text}
                                  </p>
                                  
                                  {/* Message Metadata */}
                                  <div className={`flex items-center justify-between mt-1 text-xs ${
                                    isSent ? "text-blue-100" : "text-gray-500"
                                  }`}>
                                    <span>
                                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {isSent && (
                                        <>
                                          {msg._id ? (
                                            <span className="text-green-300">✓</span>
                                          ) : (
                                            <span className="text-yellow-300">⏳</span>
                                          )}
                                          {msg.isRead && (
                                            <span className="text-blue-200">✓✓</span>
                                          )}
                                        </>
                                      )}
                                      {msg._id && (
                                        <span className="opacity-60">🗄️</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* INPUT */}
                  <div className="p-4 border-t bg-white shadow-lg">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Paperclip size={20} className="text-gray-600" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && !e.shiftKey && handleSendMessage()
                          }
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <Smile size={18} className="text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || !socket}
                        className={`p-3 rounded-full transition-all ${
                          message.trim() && socket
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    
                    {/* Connection Status */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>
                        {isConnected ? '🟢 Connected' : '🔴 Reconnecting...'}
                      </span>
                      <span>
                        {message.trim() ? `${message.length} characters` : 'Type a message'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <MessageCircle size={48} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Connections;