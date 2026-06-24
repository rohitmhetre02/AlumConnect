import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageCircle, Send, Search, X, Check, CheckCheck } from "lucide-react";
import io from "socket.io-client";

const API = () => import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminMessages = () => {
  const location = useLocation();
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "{}");
    } catch { return {}; }
  };
  const user = getStoredUser();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const [search, setSearch] = useState("");
  const [coordinators, setCoordinators] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const startChatWith = location.state?.startChatWith;

  const userId = user?.id || user?._id;
  const userDept = user?.profile?.department || user?.department || "";
  const isCoordinator = user?.role === "coordinator";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const s = io(API(), { auth: { token }, transports: ["websocket", "polling"] });
    setSocket(s);

    s.on("receiveMessage", (data) => {
      const isMe = data.senderId === userId;
      setMessages((prev) => {
        const list = prev[data.conversationId] || [];
        if (list.some((m) => m._id === data._id || (m.text === data.text && m.timestamp === data.timestamp))) return prev;
        return { ...prev, [data.conversationId]: [...list, { ...data, type: isMe ? "sent" : "received" }] };
      });
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.conversationId === data.conversationId
            ? { ...c, lastMessage: data.text, time: formatTime(data.timestamp), unread: !isMe ? (c.unread || 0) + 1 : c.unread }
            : c
        );
        localStorage.setItem("conversations", JSON.stringify(updated));
        return updated;
      });
      if (!isMe) toast(`New message from ${data.senderName}`);
    });

    s.on("connect", () => s.emit("getConversations", { userId }));
    s.on("conversationsList", (list) => {
      setConversations(list);
      localStorage.setItem("conversations", JSON.stringify(list));
    });

    loadConversations(s);
    loadCoordinators();

    return () => s.close();
  }, [userId]);

  // Handle starting a chat from navigation state (e.g. from ActionMenu)
  useEffect(() => {
    if (!startChatWith || !socket || !userId) return;
    const start = async () => {
      try {
        const res = await fetch(`${API()}/api/conversations/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            userId: startChatWith.userId,
            userName: startChatWith.userName,
            userAvatar: startChatWith.userAvatar || "",
            userRole: startChatWith.userRole || "",
            userDepartment: startChatWith.userDepartment || "",
          }),
        });
        const data = await res.json();
        if (data.success) {
          const conv = data.data;
          setConversations((prev) => {
            const exists = prev.some((c) => c.conversationId === conv.conversationId);
            if (exists) return prev;
            const updated = [conv, ...prev];
            localStorage.setItem("conversations", JSON.stringify(updated));
            return updated;
          });
          setSelected(conv);
          setMessages((prev) => ({ ...prev, [conv.conversationId]: [] }));
          if (socket) socket.emit("joinConversation", conv.conversationId);
        }
      } catch (e) {
        console.error("Failed to start chat:", e);
      } finally {
        loadConversations();
      }
    };
    start();
    // Clear state to avoid re-triggering
    window.history.replaceState({}, document.title);
  }, [startChatWith, socket, userId]);

  const loadConversations = async (socketToUse) => {
    try {
      const res = await fetch(`${API()}/api/conversations/conversations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
        localStorage.setItem("conversations", JSON.stringify(data.data));
        if (socketToUse?.connected) {
          data.data.forEach((conv) => {
            socketToUse.emit("joinConversation", conv.conversationId);
          });
        }
      }
    } catch {
      const stored = localStorage.getItem("conversations");
      if (stored) setConversations(JSON.parse(stored));
    }
  };

  const loadCoordinators = async () => {
    try {
      const res = await fetch(`${API()}/api/directory/coordinators`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        const filtered = userDept
          ? data.data.filter((c) => c.department?.toLowerCase() === userDept.toLowerCase())
          : data.data;
        setCoordinators(filtered);
      }
    } catch {}
  };

  const loadMessages = async (convId) => {
    try {
      const res = await fetch(`${API()}/api/conversations/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      const data = await res.json();
      if (data.success) {
        const mapped = (data.data || []).map((m) => ({
          ...m,
          type: (m.senderId === userId || m.senderId === user?.id) ? "sent" : "received",
        }));
        setMessages((prev) => ({ ...prev, [convId]: mapped }));
      }
    } catch {}
  };

  const selectConversation = async (conv) => {
    setSelected(conv);
    if (socket) {
      socket.emit("joinConversation", conv.conversationId);
    }
    if (messages[conv.conversationId]?.length) return;
    await loadMessages(conv.conversationId);
    // Reset unread count locally and in backend
    if (socket && conv.unread > 0) {
      socket.emit("markMessagesAsRead", { conversationId: conv.conversationId });
    }
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.conversationId === conv.conversationId ? { ...c, unread: 0 } : c
      );
      localStorage.setItem("conversations", JSON.stringify(updated));
      return updated;
    });
  };

  const sendMessage = () => {
    if (!text.trim() || !selected || !socket) return;
    const data = {
      conversationId: selected.conversationId,
      senderId: userId,
      senderName: user?.name || ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email?.split('@')[0] || "User"),
      senderRole: user?.role || "User",
      recipientId: selected.id || selected.participants?.find((p) => p.userId !== userId)?.userId,
      recipientName: selected.name,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit("sendMessage", data);
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.conversationId === selected.conversationId ? { ...c, lastMessage: text.trim(), time: "Just now" } : c
      );
      localStorage.setItem("conversations", JSON.stringify(updated));
      return updated;
    });
    setText("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const startCoordinatorChat = async (coord) => {
    try {
      const res = await fetch(`${API()}/api/conversations/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          userId: coord.id || coord._id,
          userName: coord.name,
          userAvatar: coord.avatar || "",
          userRole: "coordinator",
          userDepartment: coord.department || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const conv = data.data;
        setConversations((prev) => {
          const exists = prev.some((c) => c.conversationId === conv.conversationId);
          if (exists) return prev;
          const updated = [conv, ...prev];
          localStorage.setItem("conversations", JSON.stringify(updated));
          return updated;
        });
        setSelected(conv);
        setMessages((prev) => ({ ...prev, [conv.conversationId]: [] }));
        if (socket) socket.emit("joinConversation", conv.conversationId);
      }
    } catch {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selected]);

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    if (diff < 604800000) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[d.getDay()] + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const conversationsList = Array.isArray(conversations) ? conversations : [];
  const filtered = conversationsList.filter((c) => {
    const otherDept = c.department || c.participants?.find((p) => p.userId !== userId)?.department || "";
    const matchDept = !otherDept || !userDept || otherDept.toLowerCase() === userDept.toLowerCase();
    return matchDept && (c.name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-white rounded-xl shadow border h-[calc(100vh-8rem)] flex overflow-hidden">
      {/* LEFT - Conversation List */}
      <div className="w-80 border-r border-gray-200 flex flex-col flex-shrink-0">
        {!isCoordinator && coordinators.length > 0 && (
          <div className="border-b">
            <div className="p-3 pb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Coordinator</p>
            </div>
            <div className="p-2 space-y-1">
              {coordinators.map((coord) => (
                <div
                  key={coord.id || coord._id}
                  onClick={() => startCoordinatorChat(coord)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50 border border-transparent ${
                    selected?.id === (coord.id || coord._id) ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  {coord.avatar ? (
                    <img src={coord.avatar} alt={coord.name} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {coord.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{coord.name}</p>
                    <p className="text-xs text-gray-500">Coordinator</p>
                    {coord.department && (
                      <p className="text-xs text-gray-400 mt-0.5">{coord.department}</p>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium self-center">Online</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="p-3 border-b">
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="ml-2 bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length > 0 && (
            <div className="p-3 space-y-2">
              {filtered.map((conv) => {
                const isActive = selected?.conversationId === conv.conversationId;
                    const other = conv.participants?.find((p) => p.userId !== userId);
                    const name = other?.userName || conv.name || "User";
                    const avatar = other?.userAvatar || conv.avatar || "";
                    const role = other?.userRole || conv.role || "";
                    const dept = other?.userDepartment || conv.department || "";
                return (
                  <div
                    key={conv.conversationId || conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {name.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
                        <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{conv.time || formatTime(conv.updatedAt) || ""}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage || "No messages yet"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {role && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{role}</span>}
                        {dept && <span className="text-xs text-gray-400">{dept}</span>}
                      </div>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
                <div className="p-4 border-b flex items-center gap-3">
                  {(() => {
                    const other = selected.participants?.find((p) => p.userId !== userId);
                    const headerName = other?.userName || selected.name || "User";
                    const headerAvatar = other?.userAvatar || selected.avatar || "";
                    const headerRole = other?.userRole || selected.role || "";
                    return (
                      <>
                        {headerAvatar ? (
                          <img src={headerAvatar} alt={headerName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {headerName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{headerName}</p>
                          <p className="text-xs text-gray-500">{headerRole}</p>
                        </div>
                      </>
                    );
                  })()}
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {(messages[selected.conversationId] || []).length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-12">
                    <MessageCircle size={40} className="mx-auto mb-2 text-gray-300" />
                    <p>Start chatting with {selected.name}</p>
                  </div>
                ) : (
                  (messages[selected.conversationId] || []).map((msg, i) => {
                    const isSent = msg.senderId === userId || msg.senderId === user?.id;
                    return (
                      <div key={msg._id || i} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isSent ? "bg-blue-600 text-white" : "bg-white border"}`}>
                          <p className="text-sm">{msg.text}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isSent ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] opacity-70">{formatTime(msg.timestamp)}</span>
                            {isSent && (
                              <span>{msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
