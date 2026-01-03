import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  /* ---------------- CHECK AUTH ---------------- */
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (err) {
      console.log("checkAuth failed");
    }
  };

  /* ---------------- LOGIN / SIGNUP ---------------- */
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const { user, token } = data.userData;

      setAuthUser(user);
      setToken(token);
      localStorage.setItem("token", token);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      connectSocket(user);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    socket?.disconnect();
    toast.success("Logged out");
  };

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success(data.message);
        return true;
      }

      toast.error(data.message);
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      return false;
    }
  };

  /* ---------------- SOCKET ---------------- */
  const connectSocket = (user) => {
    if (!user || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: user._id },
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      checkAuth();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
