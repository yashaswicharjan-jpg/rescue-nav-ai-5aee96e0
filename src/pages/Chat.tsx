import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { ChatInterface } from "@/components/ChatInterface";

const Chat = () => {
  return (
    <div className="flex h-screen flex-col bg-background">
      <SafePathHeader />
      <div className="flex-1 overflow-hidden pb-16">
        <ChatInterface />
      </div>
      <BottomNav />
    </div>
  );
};

export default Chat;
