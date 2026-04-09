import { Map, MessageCircle, Shield, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SOSButton } from "./SOSButton";

const navItems = [
  { icon: Map, label: "Map", path: "/" },
  { icon: MessageCircle, label: "AI Chat", path: "/chat" },
  { icon: Shield, label: "Protocols", path: "/protocols" },
  { icon: Camera, label: "Detect", path: "/detect" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex items-center justify-around px-2 py-1">
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
              pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}

        <div className="relative -mt-6">
          <SOSButton />
        </div>

        {navItems.slice(2).map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
              pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
