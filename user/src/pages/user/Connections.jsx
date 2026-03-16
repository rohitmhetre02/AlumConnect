import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("messages");
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isCoordinator = user?.role === "coordinator";

  useEffect(() => {
    const mockConnections = [
      {
        id: 1,
        name: "John Doe",
        role: "Alumni",
        department: "Computer Science",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      {
        id: 2,
        name: "Jane Smith",
        role: "Mentor",
        department: "Engineering",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      {
        id: 3,
        name: "Mike Johnson",
        role: "Student",
        department: "Business",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
    ];

    const mockRequests = [
      {
        id: 4,
        name: "Sarah Wilson",
        role: "Alumni",
        department: "Mathematics",
        avatar: "https://i.pravatar.cc/150?img=4",
        status: "pending",
      },
      {
        id: 5,
        name: "Tom Brown",
        role: "Student",
        department: "Physics",
        avatar: "https://i.pravatar.cc/150?img=5",
        status: "pending",
      },
    ];

    const mockConversations = [
      {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?img=1",
        lastMessage: "Hey, are you available for a quick chat?",
        time: "2 min ago",
        unread: 2,
      },
      {
        id: 2,
        name: "Jane Smith",
        avatar: "https://i.pravatar.cc/150?img=2",
        lastMessage: "Thanks for the mentorship session!",
        time: "1 hour ago",
        unread: 0,
      },
      {
        id: 3,
        name: "Mike Johnson",
        avatar: "https://i.pravatar.cc/150?img=3",
        lastMessage: "Can you help me with the project?",
        time: "3 hours ago",
        unread: 1,
      },
    ];

    setConnections(mockConnections);
    setConnectionRequests(mockRequests);
    setConversations(mockConversations);
  }, []);

  const handleAcceptConnection = async (requestId) => {
    try {
      const response = await fetch("/api/user/accept-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Connection request accepted");

        const acceptedUser = connectionRequests.find((r) => r.id === requestId);

        setConnectionRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );

        setConnections((prev) => [...prev, acceptedUser]);
      } else {
        toast.error(data.message || "Failed to accept connection");
      }
    } catch (error) {
      toast.error("Failed to accept connection request");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/user/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("");

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: message.trim(),
                  time: "Just now",
                  unread: 0,
                }
              : conv
          )
        );
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unread: 0 } : conv
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Connections</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-slate-200">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "messages"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500"
              }`}
            >
              Messages
              {conversations.filter((c) => c.unread > 0).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {conversations.filter((c) => c.unread > 0).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("connections")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "connections"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500"
              }`}
            >
              Connections
            </button>
          </div>

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="flex h-[500px]">
              {/* LEFT SIDE */}
              <div className="w-1/3 border-r overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="p-4 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={conversation.avatar}
                        className="w-10 h-10 rounded-full"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{conversation.name}</p>

                          {conversation.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                              {conversation.unread}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CHAT AREA */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="p-4 border-b flex items-center gap-3">
                      <img
                        src={selectedConversation.avatar}
                        className="w-10 h-10 rounded-full"
                      />
                      <p className="font-semibold">
                        {selectedConversation.name}
                      </p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                      <p className="text-gray-500">
                        Previous messages will appear here
                      </p>
                    </div>

                    <div className="border-t p-4 flex gap-2">
                      <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 border rounded-lg px-3 py-2"
                        placeholder="Type message..."
                      />

                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        {loading ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    Select conversation
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONNECTIONS */}
          {activeTab === "connections" && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Connection Requests
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {connectionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 text-center"
                  >
                    <img
                      src={request.avatar}
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                    />

                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-gray-500">{request.role}</p>

                    {!isCoordinator && (
                      <button
                        onClick={() => handleAcceptConnection(request.id)}
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mb-4">Active Connections</h3>

              <div className="grid md:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="border rounded-lg p-4 text-center"
                  >
                    <img
                      src={connection.avatar}
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                    />

                    <p className="font-medium">{connection.name}</p>
                    <p className="text-sm text-gray-500">
                      {connection.department}
                    </p>

                    <button
                      onClick={() =>
                        navigate(`/dashboard/connections/${connection.id}/chat`)
                      }
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
