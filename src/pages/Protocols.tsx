import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { EmergencyProtocols } from "@/components/EmergencyProtocols";

const Protocols = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <EmergencyProtocols />
      </main>
      <BottomNav />
    </div>
  );
};

export default Protocols;
