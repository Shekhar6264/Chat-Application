import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, authUser } = useContext(AuthContext);

  /* ---------- USERS ---------- */
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch {
      toast.error("Failed to load users");
    }
  };

  /* ---------- GET MESSAGES ---------- */
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        const safe = data.messages
          .filter(Boolean)
          .map((m) => ({
            ...m,
            senderId:
              typeof m.senderId === "object" ? m.senderId._id : m.senderId,
          }));
        setMessages(safe);
      }
    } catch {
      toast.error("Failed to load messages");
    }
  };

  /* ---------- SEND MESSAGE (FIXED) ---------- */
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success && data.message) {
        const safeMsg = {
          ...data.message,
          senderId: authUser._id,              // ✅ force sender
          createdAt: new Date().toISOString(), // ✅ ensure time
        };

        // ✅ optimistic update (sender sees instantly)
        setMessages((prev) => [...prev, safeMsg]);
      }
    } catch {
      toast.error("Message send failed");
    }
  };

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!socket || !authUser) return;

    const handleNewMessage = (msg) => {
      if (!msg) return;

      const senderId =
        typeof msg.senderId === "object"
          ? msg.senderId._id
          : msg.senderId;

      // ❌ ignore own message (already added optimistically)
      if (senderId === authUser._id) return;

      const safeMsg = { ...msg, senderId };

      if (selectedUser && senderId === selectedUser._id) {
        setMessages((prev) => [...prev, safeMsg]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, authUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        setMessages,
        setUnseenMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
