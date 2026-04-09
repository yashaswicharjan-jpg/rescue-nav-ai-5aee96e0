import { useState } from "react";
import { Phone } from "lucide-react";

export const SOSButton = () => {
  const [activated, setActivated] = useState(false);

  const handleSOS = () => {
    setActivated(true);
    setTimeout(() => setActivated(false), 3000);
  };

  return (
    <button
      onClick={handleSOS}
      className={`sos-pulse flex h-16 w-16 items-center justify-center rounded-full bg-danger text-danger-foreground shadow-lg transition-all ${
        activated ? "scale-110 ring-4 ring-danger/50" : ""
      }`}
      aria-label="SOS Emergency"
    >
      <div className="text-center">
        <Phone className="mx-auto h-6 w-6" />
        <span className="text-[9px] font-bold">SOS</span>
      </div>
    </button>
  );
};
