import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { VisualDetection } from "@/components/VisualDetection";

const Detect = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />
      <main className="flex-1 overflow-y-auto pb-24">
        <VisualDetection />
      </main>
      <BottomNav />
    </div>
  );
};

export default Detect;
