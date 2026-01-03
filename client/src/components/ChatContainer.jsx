import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import formateMessageTime from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    setMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  /* LOAD MESSAGES ON USER CHANGE */
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  /* AUTO SCROLL */
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  return selectedUser ? (
    <div className="h-full overflow-y-auto overflow-x-hidden relative backdrop-blur-lg">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          className="hidden md:block max-w-5 cursor-pointer"
        />
      </div>

      {/* MESSAGES */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages
          .filter((msg) => msg && msg.senderId)
          .map((msg, index) => {
            const isSender = msg.senderId === authUser._id;

            return (
              <div
                key={msg._id || index}
                className={`flex items-end gap-2 mb-4 ${
                  isSender ? "justify-end" : "justify-start"
                }`}
              >
                {!isSender && (
                  <img
                    src={selectedUser.profilePic || assets.avatar_icon}
                    className="w-7 h-7 rounded-full"
                  />
                )}

                {msg.image ? (
                  <img
                    src={msg.image}
                    className="max-w-[230px] rounded-2xl border border-gray-700 object-cover"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] rounded-lg break-all text-white flex justify-between items-end gap-2 ${
                      isSender
                        ? "bg-violet-500/40 rounded-br-none"
                        : "bg-gray-500/30 rounded-bl-none"
                    }`}
                  >
                    <span>{msg.text}</span>
                    <span className="text-[10px] text-gray-300 whitespace-nowrap">
                      {msg.createdAt ? formateMessageTime(msg.createdAt) : ""}
                    </span>
                  </p>
                )}

                {isSender && (
                  <img
                    src={authUser.profilePic || assets.avatar_icon}
                    className="w-7 h-7 rounded-full"
                  />
                )}
              </div>
            );
          })}

        <div ref={scrollEnd} />
      </div>

      {/* INPUT */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Send a message"
            className="flex-1 text-sm p-3 bg-transparent outline-none text-white"
          />
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImage}
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              className="max-w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="h-full flex flex-col justify-center items-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;