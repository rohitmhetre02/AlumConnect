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
  CheckCheck 
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
  const [messages, setMessages] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestFilter, setRequestFilter] = useState("all");
  const messagesEndRef = useRef(null);

  // Count sent and received requests
  const sentCount = connectionRequests.filter(req => req.sender === user?.id).length;
  const receivedCount = connectionRequests.filter(req => req.recipient === user?.id).length;

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access connections');
      navigate('/login');
      return;
    }

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server with ID:', newSocket.id);
      setIsConnected(true);
      toast.success('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
      toast.error('Disconnected from chat server');
    });

    newSocket.on('receiveMessage', (data) => {
      console.log('📨 Received message:', data);
      console.log('📨 Current user ID:', user?.id);
      console.log('📨 Message sender ID:', data.senderId);
      console.log('📨 Is message from current user?', data.senderId === user?.id);
      
      // Add message to correct conversation, but avoid duplicates
      setMessages(prev => {
        const conversationMessages = prev[data.conversationId] || [];
        
        // Check if message already exists (to prevent duplicates)
        const messageExists = conversationMessages.some(msg => 
          msg.id === data.id || (msg.text === data.text && msg.timestamp === data.timestamp)
        );
        
        if (messageExists) {
          console.log('🔄 [Frontend] Message already exists, skipping:', data.id);
          return prev;
        }
        
        const updated = {
          ...prev,
          [data.conversationId]: [...conversationMessages, {
            ...data,
            type: data.senderId === user?.id ? 'sent' : 'received'
          }]
        };
        console.log('📝 Updated messages state:', updated);
        console.log('📝 Messages for conversation ' + data.conversationId + ':', updated[data.conversationId]);
        return updated;
      });
      
      // Update conversation's last message and unread count
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.conversationId === data.conversationId 
            ? { 
                ...conv, 
                lastMessage: data.text,
                time: formatTime(data.timestamp),
                unread: data.senderId !== user?.id ? (conv.unread || 0) + 1 : conv.unread
              }
            : conv
        );
        
        // Save to localStorage
        localStorage.setItem('conversations', JSON.stringify(updated));
        return updated;
      });

      // Show notification for received messages
      if (data.senderId !== user?.id) {
        toast.success(`New message from ${data.senderName}`);
      }
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
        const requestsResponse = await fetch('http://localhost:5000/api/user/requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const requestsData = await requestsResponse.json()
        console.log('📋 [Frontend] Connection requests loaded:', requestsData)
        setConnectionRequests(requestsData.data || [])
        
        // Load connections
        const connectionsResponse = await fetch('http://localhost:5000/api/user/connections', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const connectionsData = await connectionsResponse.json()
        console.log('🤝 [Frontend] Connections loaded:', connectionsData)
        setConnections(connectionsData.data || [])
        
        // Load conversations from localStorage first
        const storedConversations = localStorage.getItem('conversations');
        if (storedConversations) {
          const parsed = JSON.parse(storedConversations);
          console.log('💾 [Frontend] Loaded conversations from localStorage:', parsed);
          setConversations(parsed);
        } else {
          console.log('📝 No stored conversations found, starting empty');
          // Start with empty conversations
          setConversations([]);
          setMessages({});
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

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.set('tab', tab);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    console.log('🔄 [Frontend] Selecting conversation:', conversation);
    setSelectedConversation(conversation);

    // Load messages for this conversation from memory (not database API)
    try {
      // First, check if we already have messages in state
      if (messages[conversation.conversationId] && messages[conversation.conversationId].length > 0) {
        console.log('📨 [Frontend] Using existing messages from state:', messages[conversation.conversationId]);
      } else {
        console.log('📨 [Frontend] No existing messages, will receive from socket when joining room');
        
        // Join the conversation room to receive messages
        if (socket) {
          console.log('🔄 [Frontend] Joining conversation room:', conversation.conversationId);
          socket.emit('joinConversation', conversation.conversationId);
        }
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation || !socket) return;

    // Create message object with proper sender info
    const messageData = {
      conversationId: selectedConversation.conversationId,
      senderId: user?.id,
      senderName: user?.name || user?.firstName + ' ' + user?.lastName || 'You',
      senderRole: user?.role || 'User',
      recipientId: selectedConversation.id,
      recipientName: selectedConversation.name,
      text: message.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('📤 [Frontend] Sending message with data:', messageData);
    console.log('📤 [Frontend] Current user:', user);
    console.log('📤 [Frontend] Selected conversation:', selectedConversation);

    // Add message to local state immediately for real-time UI update
    const newMessage = {
      ...messageData,
      id: Date.now().toString(), // Temporary ID
      type: 'sent',
      isRead: false
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation.conversationId]: [...(prev[selectedConversation.conversationId] || []), newMessage]
    }));

    // Send message via Socket.io
    socket.emit('sendMessage', messageData);
    console.log('📤 Message sent to server');

    // Update conversation's last message immediately for better UX
    setConversations(prev => prev.map(conv => 
      conv.conversationId === selectedConversation.conversationId 
        ? { 
            ...conv, 
            lastMessage: message.trim(),
            time: 'Just now'
          }
        : conv
    ));

    // Save updated conversations to localStorage
    setConversations(prev => {
      localStorage.setItem('conversations', JSON.stringify(prev));
      return prev;
    });

    // Clear input
    setMessage("");
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle accepting requests
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Request accepted!");
        setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Error accepting request");
    }
  };

  // Handle rejecting requests
  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Request rejected!");
        setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Error rejecting request");
    }
  };

  // Handle URL params for creating conversations
  useEffect(() => {
    const userId = searchParams.get('userId');
    const tab = searchParams.get('tab');
    const state = location.state;

    if (tab) {
      setActiveTab(tab);
    }

    if (userId && state) {
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
              const existingIndex = prev.findIndex(conv => conv.id === userId);
              
              let updated;
              if (existingIndex !== -1) {
                console.log('🔄 [Frontend] Updating existing conversation');
                // Replace existing conversation
                updated = [...prev];
                updated[existingIndex] = data.data;
              } else {
                console.log('🔄 [Frontend] Adding new conversation');
                // Add new conversation to the beginning
                updated = [data.data, ...prev];
              }
              
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
    }
  }, [searchParams, location.state, socket, user?.id]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => handleTabChange("messages")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "messages"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => handleTabChange("connections")}
                className={`flex-1 py-4 text-center font-medium transition-colors ${
                  activeTab === "connections"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                }`}
              >
                Connections
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="h-[600px] flex">
            {/* MESSAGES */}
            {activeTab === "messages" && (
              <div className="flex w-full">
                {/* LEFT - Conversations List */}
                <div className="w-80 border-r border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Conversations</h3>
                    
                    {conversations.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No conversations yet</p>
                        <p className="text-xs mt-1">Start messaging to see conversations here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {conversations.map((conv) => {
                          const isActive = selectedConversation?.conversationId === conv.conversationId;
                          return (
                            <div
                              key={conv.conversationId}
                              onClick={() => {
                                console.log('🔄 [Frontend] Clicking conversation card:', conv);
                                console.log('🔄 [Frontend] Current selected:', selectedConversation);
                                handleSelectConversation(conv);
                              }}
                              className={`bg-white rounded-lg p-4 cursor-pointer border-2 transition-all hover:shadow-md ${
                                isActive
                                  ? "border-blue-500 shadow-md bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={conv.avatar}
                                  alt={conv.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://i.pravatar.cc/150?img=${conv.id.slice(-2)}`;
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 truncate">{conv.name}</h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                      {conv.time}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm text-gray-600 truncate">
                                      {conv.lastMessage}
                                    </p>
                                    {conv.unread > 0 && (
                                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2">
                                        {conv.unread}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                      {conv.role}
                                    </span>
                                    {conv.department && (
                                      <span className="text-xs text-gray-500">
                                        • {conv.department}
                                      </span>
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

                {/* RIGHT - Chat Area */}
                <div className="flex-1 flex flex-col">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b bg-white">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={selectedConversation.avatar}
                              alt={selectedConversation.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {selectedConversation.isOnline && (
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{selectedConversation.name}</p>
                            <p className="text-sm text-gray-500">{selectedConversation.role}</p>
                          </div>
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <div className="space-y-4">
                          {messages[selectedConversation.conversationId]?.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-8">
                              <p>Start a conversation with {selectedConversation.name}</p>
                              <p className="text-xs mt-1">This is the beginning of your chat</p>
                            </div>
                          ) : (
                            messages[selectedConversation.conversationId]?.map((msg, index) => {
                              console.log('🔄 Rendering message:', msg);
                              console.log('🔄 Message data:', {
                                senderId: msg.senderId,
                                currentUserId: user?.id,
                                senderName: msg.senderName,
                                isSent: msg.senderId === user?.id
                              });
                              
                              const isSent = msg.senderId === user?.id;
                              const isRead = msg.isRead || false;
                              
                              return (
                                <div key={msg.id || index} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[70%] rounded-lg p-3 ${
                                    isSent 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-white shadow'
                                  }`}>
                                    <p className="text-sm font-medium">{msg.text}</p>
                                    <div className={`text-xs mt-1 flex items-center justify-between ${
                                      isSent ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {isSent ? 'You' : (msg.senderName || 'Unknown User')}
                                        </span>
                                        {!isSent && msg.senderRole && (
                                          <span className="text-xs opacity-75">{msg.senderRole}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span>{formatTime(msg.timestamp)}</span>
                                        {isSent && (
                                          <span className="ml-1">
                                            {isRead ? (
                                              <CheckCheck size={14} className="text-blue-200" />
                                            ) : (
                                              <Check size={14} className="text-gray-300" />
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t bg-white">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                          >
                            {loading ? "..." : "Send"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
                      <div className="text-center">
                        <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
