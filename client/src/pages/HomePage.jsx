import { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`
          h-full rounded-2xl border border-gray-600
          backdrop-blur-xl overflow-hidden
          grid grid-cols-1
          ${selectedUser 
            ? "md:grid-cols-[1fr_1.6fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"}
        `}
      >
        {/* LEFT */}
        <Sidebar />

        {/* CENTER */}
        <ChatContainer />

        {/* RIGHT */}
        {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
