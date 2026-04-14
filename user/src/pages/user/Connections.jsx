import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { 
  MessageCircle, 
  Check, 
  CheckCheck,
  X
} from "lucide-react";

const Connections = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("requests");
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all");

  const isCoordinator = user?.role === "coordinator";

  useEffect(() => {
    // Load connection requests and connections from API
    const loadData = async () => {
      try {
        // Load connection requests
        const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const requestsData = await requestsResponse.json()
        
        setConnectionRequests(requestsData.data || [])
        
        // Load connections
        const connectionsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/connections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const connectionsData = await connectionsResponse.json()
        
        setConnections(connectionsData.data || [])
      } catch (error) {
        console.error('Failed to load data:', error)
        // Start with empty state on error
        setConnections([]);
        setConnectionRequests([]);
      }
    }

    loadData();
  }, [user?.id]); // Only depend on user ID to prevent duplicate calls

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/accept-request/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success("Connection accepted");

        const acceptedUser = connectionRequests.find(
          (r) => (r.id === requestId || r._id === requestId)
        );

        setConnectionRequests((prev) =>
          prev.filter((req) => req.id !== requestId && req._id !== requestId)
        );

        const connectionUser = {
          id: acceptedUser?.fromUserId || requestId,
          _id: acceptedUser?._id || requestId,
          name: acceptedUser?.fromUserName || 'User',
          role: acceptedUser?.fromRole || 'User',
          department: acceptedUser?.fromDepartment || 'Computer Science',
          currentYear: acceptedUser?.fromCurrentYear,
          passoutYear: acceptedUser?.fromPassoutYear,
          avatar: acceptedUser?.fromUserAvatar || 'https://i.pravatar.cc/150?img=1',
          acceptedAt: new Date().toISOString()
        };

        setConnections((prev) => [...prev, connectionUser]);
      } else {
        toast.error(data.message || "Failed to accept request");
      }
    } catch {
      toast.error("Error accepting request");
    }
  };

const handleRejectRequest = async (requestId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/reject-request/${requestId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    const data = await response.json();

    if (data.success) {
      toast.success("Connection request rejected");
      setConnectionRequests((prev) =>
        prev.filter((req) => req.id !== requestId && req._id !== requestId)
      );
    } else {
      toast.error(data.message || "Failed to reject request");
    }
  } catch {
    toast.error("Error rejecting request");
  }
};

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
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold">Connections</h1>
      </div>

      <div className="bg-white rounded-xl shadow border">
        {/* TABS */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 relative ${
              activeTab === "requests"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Requests
            {connectionRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {connectionRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* CONNECTION REQUESTS */}
        {activeTab === "requests" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Connection Requests & Connections</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRequestFilter("all")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    requestFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({connectionRequests.length + connections.length})
                </button>
                <button
                  onClick={() => setRequestFilter("received")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    requestFilter === "received"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Received ({receivedCount})
                </button>
                <button
                  onClick={() => setRequestFilter("sent")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    requestFilter === "sent"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sent ({sentCount})
                </button>
                <button
                  onClick={() => setRequestFilter("connected")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    requestFilter === "connected"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Connected ({connections.length})
                </button>
              </div>
            </div>

            {/* Show Pending Requests Section */}
            {getFilteredRequests().length > 0 && (
              <div className="mb-8">
                <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Pending Requests ({getFilteredRequests().length})
                </h4>
                <div className="space-y-4">
                  {getFilteredRequests().map((request) => {
                    const isReceived = request.toUserId === user?.id;
                    const isSent = request.fromUserId === user?.id;
                    const requestKey = request._id || request.id; // Use MongoDB _id as key
                    
                    return (
                      <div key={requestKey} className="bg-white border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            {(isReceived ? request.fromUserName : request.toUserName)?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {isReceived ? request.fromUserName : request.toUserName}
                                </h4>
                                <p className="text-sm text-gray-600 mb-1">
                                  {isReceived ? request.fromRole : request.toRole}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                  {isReceived ? request.fromDepartment : request.toDepartment}
                                </p>
                                {/* Show year based on role */}
                                <p className="text-sm text-gray-500 mb-2">
                                  {isReceived ? (
                                    request.fromRole === 'alumni' 
                                      ? `Passout Year: ${request.fromPassoutYear || 'N/A'}`
                                      : request.fromRole === 'student'
                                      ? `Current Year: ${request.fromCurrentYear || 'N/A'}`
                                      : ''
                                  ) : (
                                    request.toRole === 'alumni'
                                      ? `Passout Year: ${request.toPassoutYear || 'N/A'}`
                                      : request.toRole === 'student'
                                      ? `Current Year: ${request.toCurrentYear || 'N/A'}`
                                      : ''
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                              
                              {/* Action Buttons */}
                              {isReceived && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptRequest(requestKey)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors"
                                  >
                                    <Check size={16} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(requestKey)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors"
                                  >
                                    <X size={16} />
                                    Reject
                                  </button>
                                </div>
                              )}
                              
                              {isSent && (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                  <div className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></div>
                                  Pending
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Show Accepted Connections Section */}
            {(requestFilter === "all" || requestFilter === "connected") && connections.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Connected ({connections.length})
                </h4>
                <div className="space-y-4">
                  {connections.map((connection) => {
                    const connectionKey = connection._id || connection.id; // Use MongoDB _id as key
                    
                    return (
                      <div key={connectionKey} className="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            {connection.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {connection.name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-1">
                                  {connection.role}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                  {connection.department}
                                </p>
                                {/* Show year based on role */}
                                <p className="text-sm text-gray-500 mb-2">
                                  {connection.role === 'alumni' 
                                    ? `Passout Year: ${connection.passoutYear || 'N/A'}`
                                    : connection.role === 'student'
                                    ? `Current Year: ${connection.currentYear || 'N/A'}`
                                    : ''
                                  }
                                </p>
                                <p className="text-xs text-gray-400">
                                  Connected {connection.acceptedAt ? new Date(connection.acceptedAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/dashboard/connections?tab=messages&userId=${connectionKey}`, {
                                    state: {
                                      userName: connection.name,
                                      userRole: connection.role,
                                      userAvatar: connection.avatar,
                                      userDepartment: connection.department
                                    }
                                  })}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                                >
                                  <MessageCircle size={16} />
                                  Message
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {getFilteredRequests().length === 0 && (requestFilter === "all" || requestFilter === "connected") && connections.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No requests or connections</p>
                <p className="text-gray-400 text-sm">
                  {requestFilter === "sent" 
                    ? "You haven't sent any connection requests yet."
                    : requestFilter === "received"
                    ? "No pending requests to respond to."
                    : requestFilter === "connected"
                    ? "No connections yet. Start connecting with people!"
                    : "No connection requests or connections at the moment."
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Connections;