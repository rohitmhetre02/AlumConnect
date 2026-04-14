import { useState, useRef, useEffect } from "react";
import { Send, X, Search, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";

const MessagesPanel = ({
  isOpen,
  onClose,
  conversations = {},
  activeConversationId,
  viewMode,
  onShowList,
  onSelectConversation,
}) => {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [localConversations, setLocalConversations] = useState(conversations);

  const messagesEndRef = useRef(null);

  /* ================= TIME ================= */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!isOpen || !user) return;

    const token = localStorage.getItem("token");

    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      { auth: { token } }
    );

    setSocket(newSocket);

    newSocket.on("receiveMessage", (message) => {
      setLocalConversations((prev) => {
        const updated = { ...prev };

        if (!updated[message.conversationId]) {
          updated[message.conversationId] = [];
        }

        // ✅ FIX: avoid duplicates (ONLY by _id)
        const exists = updated[message.conversationId].some(
          (m) => m._id === message._id
        );

        if (!exists) {
          updated[message.conversationId].push(message);
        }

        return updated;
      });
    });

    newSocket.on("userOnline", (id) =>
      setOnlineStatus((p) => ({ ...p, [id]: true }))
    );

    newSocket.on("userOffline", (id) =>
      setOnlineStatus((p) => ({ ...p, [id]: false }))
    );

    return () => newSocket.close();
  }, [isOpen, user]);

  /* ================= SYNC ================= */
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  /* ================= SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localConversations, activeConversationId]);

  /* ================= FIXED CONVERSATION LIST ================= */
  const conversationList = Object.keys(localConversations)
    .filter((k) => !k.startsWith("userInfo_"))
    .map((id) => {
      const msgs = localConversations[id] || [];
      const last = msgs[msgs.length - 1];

      // ✅ FIX: get OTHER user
      const otherUser =
        msgs.find((m) => m.senderId !== user?.id) || last;

      const name =
        otherUser?.senderName ||
        otherUser?.recipientName ||
        "User";

      return {
        id,
        name,
        avatar: name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
        lastMessage: last?.text || "No messages",
        time: last ? formatTime(last.timestamp) : "",
        unread: msgs.filter(
          (m) => !m.isRead && m.senderId !== user?.id
        ).length,
        isOnline: onlineStatus[otherUser?.senderId] || false,
      };
    });

  const filtered = conversationList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messages = localConversations[activeConversationId] || [];
  const activeUser = conversationList.find(
    (c) => c.id === activeConversationId
  );

  /* ================= SEND ================= */
  const handleSend = async () => {
    if (!draft.trim() || !activeConversationId) return;

    const tempMsg = {
      _id: Date.now(),
      senderId: user?.id,
      senderName: user?.name,
      text: draft.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // ✅ Optimistic UI
    setLocalConversations((prev) => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        tempMsg,
      ],
    }));

    setDraft("");

    // send to backend
    await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...tempMsg,
        conversationId: activeConversationId,
      }),
    });

    // socket emit
    socket?.emit("sendMessage", tempMsg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">

        {/* HEADER */}
        <div className="flex items-center p-3 bg-blue-600 text-white">
          {viewMode === "conversation" && (
            <button onClick={onShowList}>
              <ArrowLeft />
            </button>
          )}

          {viewMode === "conversation" ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-white text-blue-600 flex items-center justify-center rounded-full font-bold">
                {activeUser?.avatar}
              </div>
              <p className="font-semibold">{activeUser?.name}</p>
            </div>
          ) : (
            <h2 className="ml-2 font-semibold">Messages</h2>
          )}

          <button onClick={onClose} className="ml-auto">
            <X />
          </button>
        </div>

        {/* LIST */}
        {viewMode === "list" && (
          <>
            <div className="p-3 border-b">
              <div className="flex bg-gray-100 px-3 py-2 rounded-full">
                <Search size={16} />
                <input
                  className="ml-2 bg-transparent outline-none w-full"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className="bg-white p-4 rounded-xl shadow cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-full">
                      {c.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3>{c.name}</h3>
                        <span className="text-xs text-gray-400">
                          {c.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {c.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CHAT */}
        {viewMode === "conversation" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
              {messages.map((m) => {
                const isMe = m.senderId === user?.id;

                return (
                  <div
                    key={m._id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {m.text}
                      <div className="text-[10px] mt-1 text-right opacity-70">
                        {formatTime(m.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 border-t bg-white">
              <div className="flex bg-gray-100 px-3 py-2 rounded-full">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 bg-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white p-2 rounded-full"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;