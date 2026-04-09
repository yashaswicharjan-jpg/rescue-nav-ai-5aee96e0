export interface ProtocolStep {
  step: number;
  instruction: string;
  urgency: "immediate" | "high" | "medium";
}

export interface EmergencyProtocol {
  id: string;
  type: string;
  icon: string;
  title: string;
  steps: ProtocolStep[];
}

export const emergencyProtocols: EmergencyProtocol[] = [
  {
    id: "airstrike",
    type: "airstrike",
    icon: "💥",
    title: "Airstrike Survival",
    steps: [
      { step: 1, instruction: "DROP to the ground immediately — do NOT run", urgency: "immediate" },
      { step: 2, instruction: "Move to the nearest concrete structure or basement", urgency: "immediate" },
      { step: 3, instruction: "Stay away from windows and glass surfaces", urgency: "high" },
      { step: 4, instruction: "Cover your head and neck with your arms", urgency: "high" },
      { step: 5, instruction: "Wait at least 10 minutes before moving", urgency: "medium" },
    ],
  },
  {
    id: "earthquake",
    type: "earthquake",
    icon: "🌍",
    title: "Earthquake Response",
    steps: [
      { step: 1, instruction: "DROP, COVER, and HOLD ON", urgency: "immediate" },
      { step: 2, instruction: "Get under a sturdy table or desk", urgency: "immediate" },
      { step: 3, instruction: "Stay away from exterior walls and heavy furniture", urgency: "high" },
      { step: 4, instruction: "If outdoors, move to open area away from buildings", urgency: "high" },
      { step: 5, instruction: "After shaking stops, check for injuries and gas leaks", urgency: "medium" },
    ],
  },
  {
    id: "flood",
    type: "flood",
    icon: "🌊",
    title: "Flood Evacuation",
    steps: [
      { step: 1, instruction: "Move to higher ground IMMEDIATELY", urgency: "immediate" },
      { step: 2, instruction: "Never walk or drive through flood water", urgency: "immediate" },
      { step: 3, instruction: "Avoid bridges over fast-moving water", urgency: "high" },
      { step: 4, instruction: "If trapped, go to highest floor — signal for help", urgency: "high" },
      { step: 5, instruction: "Stay tuned to emergency broadcasts", urgency: "medium" },
    ],
  },
  {
    id: "fire",
    type: "fire",
    icon: "🔥",
    title: "Fire Escape",
    steps: [
      { step: 1, instruction: "Alert everyone — shout FIRE", urgency: "immediate" },
      { step: 2, instruction: "Get low — crawl under smoke", urgency: "immediate" },
      { step: 3, instruction: "Feel doors before opening — if hot, find another exit", urgency: "high" },
      { step: 4, instruction: "Close doors behind you to slow spread", urgency: "high" },
      { step: 5, instruction: "Once out, stay out — call emergency services", urgency: "medium" },
    ],
  },
  {
    id: "riot",
    type: "riot",
    icon: "⚠️",
    title: "Riot / Civil Unrest",
    steps: [
      { step: 1, instruction: "Move away from the crowd immediately", urgency: "immediate" },
      { step: 2, instruction: "Avoid main roads and choke points", urgency: "immediate" },
      { step: 3, instruction: "Seek shelter in a locked building", urgency: "high" },
      { step: 4, instruction: "Stay away from windows and storefronts", urgency: "high" },
      { step: 5, instruction: "Do not engage — remain neutral and calm", urgency: "medium" },
    ],
  },
];
