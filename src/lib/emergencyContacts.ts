export interface EmergencyContact {
  name: string;
  number: string;
  type: "government" | "ngo";
  description: string;
}

export interface CountryContacts {
  country: string;
  code: string;
  contacts: EmergencyContact[];
}

export const emergencyContactsByCountry: CountryContacts[] = [
  {
    country: "United States", code: "US",
    contacts: [
      { name: "Emergency Services", number: "911", type: "government", description: "Police, Fire, Ambulance" },
      { name: "FEMA", number: "1-800-621-3362", type: "government", description: "Federal Emergency Management" },
      { name: "Red Cross", number: "1-800-733-2767", type: "ngo", description: "Disaster relief and blood services" },
      { name: "Poison Control", number: "1-800-222-1222", type: "government", description: "Poison emergency" },
      { name: "Salvation Army", number: "1-800-725-2769", type: "ngo", description: "Disaster response and recovery" },
    ],
  },
  {
    country: "United Kingdom", code: "GB",
    contacts: [
      { name: "Emergency Services", number: "999", type: "government", description: "Police, Fire, Ambulance" },
      { name: "NHS", number: "111", type: "government", description: "Non-emergency medical advice" },
      { name: "British Red Cross", number: "0344-871-1111", type: "ngo", description: "Emergency response" },
      { name: "Samaritans", number: "116-123", type: "ngo", description: "Emotional support" },
    ],
  },
  {
    country: "India", code: "IN",
    contacts: [
      { name: "Emergency Services", number: "112", type: "government", description: "Unified emergency number" },
      { name: "Police", number: "100", type: "government", description: "Police emergency" },
      { name: "Fire", number: "101", type: "government", description: "Fire emergency" },
      { name: "Ambulance", number: "108", type: "government", description: "Medical emergency" },
      { name: "NDRF", number: "011-24363260", type: "government", description: "National Disaster Response Force" },
      { name: "Indian Red Cross", number: "011-23716441", type: "ngo", description: "Disaster relief" },
      { name: "Child Helpline", number: "1098", type: "ngo", description: "Child protection" },
    ],
  },
  {
    country: "Pakistan", code: "PK",
    contacts: [
      { name: "Emergency", number: "1122", type: "government", description: "Rescue and emergency" },
      { name: "Police", number: "15", type: "government", description: "Police emergency" },
      { name: "Edhi Foundation", number: "115", type: "ngo", description: "Ambulance and relief" },
      { name: "Aman Foundation", number: "1021", type: "ngo", description: "Emergency medical" },
      { name: "NDMA", number: "051-9205037", type: "government", description: "National Disaster Management" },
    ],
  },
  {
    country: "Germany", code: "DE",
    contacts: [
      { name: "Emergency", number: "112", type: "government", description: "Fire and Medical" },
      { name: "Police", number: "110", type: "government", description: "Police emergency" },
      { name: "German Red Cross", number: "030-854040", type: "ngo", description: "Disaster relief" },
      { name: "THW", number: "0800-3449526", type: "government", description: "Federal Agency for Technical Relief" },
    ],
  },
  {
    country: "France", code: "FR",
    contacts: [
      { name: "SAMU", number: "15", type: "government", description: "Medical emergency" },
      { name: "Police", number: "17", type: "government", description: "Police emergency" },
      { name: "Pompiers", number: "18", type: "government", description: "Fire department" },
      { name: "European Emergency", number: "112", type: "government", description: "EU emergency number" },
      { name: "Croix-Rouge", number: "0800-858-858", type: "ngo", description: "French Red Cross" },
    ],
  },
  {
    country: "Turkey", code: "TR",
    contacts: [
      { name: "Emergency", number: "112", type: "government", description: "Unified emergency" },
      { name: "Police", number: "155", type: "government", description: "Police emergency" },
      { name: "AFAD", number: "122", type: "government", description: "Disaster Management" },
      { name: "Kızılay", number: "168", type: "ngo", description: "Turkish Red Crescent" },
    ],
  },
  {
    country: "Japan", code: "JP",
    contacts: [
      { name: "Police", number: "110", type: "government", description: "Police emergency" },
      { name: "Fire/Ambulance", number: "119", type: "government", description: "Fire and medical" },
      { name: "Coast Guard", number: "118", type: "government", description: "Maritime emergency" },
      { name: "Japanese Red Cross", number: "03-3438-1311", type: "ngo", description: "Disaster relief" },
    ],
  },
  {
    country: "South Korea", code: "KR",
    contacts: [
      { name: "Emergency", number: "119", type: "government", description: "Fire and Medical" },
      { name: "Police", number: "112", type: "government", description: "Police emergency" },
      { name: "Korean Red Cross", number: "02-3705-3705", type: "ngo", description: "Disaster relief" },
    ],
  },
  {
    country: "China", code: "CN",
    contacts: [
      { name: "Police", number: "110", type: "government", description: "Police emergency" },
      { name: "Fire", number: "119", type: "government", description: "Fire emergency" },
      { name: "Ambulance", number: "120", type: "government", description: "Medical emergency" },
      { name: "Red Cross China", number: "010-65139999", type: "ngo", description: "Disaster relief" },
    ],
  },
  {
    country: "Brazil", code: "BR",
    contacts: [
      { name: "SAMU", number: "192", type: "government", description: "Medical emergency" },
      { name: "Police", number: "190", type: "government", description: "Police emergency" },
      { name: "Fire", number: "193", type: "government", description: "Fire department" },
      { name: "Civil Defense", number: "199", type: "government", description: "Disaster management" },
    ],
  },
  {
    country: "Russia", code: "RU",
    contacts: [
      { name: "Emergency", number: "112", type: "government", description: "Unified emergency" },
      { name: "Fire", number: "101", type: "government", description: "Fire emergency" },
      { name: "Police", number: "102", type: "government", description: "Police emergency" },
      { name: "Ambulance", number: "103", type: "government", description: "Medical emergency" },
    ],
  },
  {
    country: "Ukraine", code: "UA",
    contacts: [
      { name: "Emergency", number: "112", type: "government", description: "Unified emergency" },
      { name: "Fire", number: "101", type: "government", description: "Fire emergency" },
      { name: "Police", number: "102", type: "government", description: "Police emergency" },
      { name: "Ambulance", number: "103", type: "government", description: "Medical emergency" },
      { name: "Ukrainian Red Cross", number: "0-800-331-800", type: "ngo", description: "Humanitarian aid" },
    ],
  },
  {
    country: "Lebanon", code: "LB",
    contacts: [
      { name: "Civil Defense", number: "125", type: "government", description: "Fire and Rescue" },
      { name: "Red Cross", number: "140", type: "ngo", description: "Lebanese Red Cross ambulance" },
      { name: "Police", number: "112", type: "government", description: "Police emergency" },
      { name: "Army", number: "1701", type: "government", description: "Military emergency" },
    ],
  },
  {
    country: "Palestine", code: "PS",
    contacts: [
      { name: "Civil Defense", number: "102", type: "government", description: "Emergency rescue" },
      { name: "Red Crescent", number: "101", type: "ngo", description: "Palestinian Red Crescent" },
      { name: "Police", number: "100", type: "government", description: "Police emergency" },
      { name: "UNRWA", number: "+972-8-677-7333", type: "ngo", description: "UN Relief and Works Agency" },
    ],
  },
  {
    country: "Syria", code: "SY",
    contacts: [
      { name: "Civil Defense", number: "113", type: "government", description: "Fire and rescue" },
      { name: "Ambulance", number: "110", type: "government", description: "Medical emergency" },
      { name: "White Helmets", number: "N/A", type: "ngo", description: "Syria Civil Defence volunteer rescue" },
      { name: "ICRC Syria", number: "+963-11-444-5727", type: "ngo", description: "International Red Cross" },
    ],
  },
  {
    country: "Egypt", code: "EG",
    contacts: [
      { name: "Ambulance", number: "123", type: "government", description: "Medical emergency" },
      { name: "Police", number: "122", type: "government", description: "Police emergency" },
      { name: "Fire", number: "180", type: "government", description: "Fire department" },
      { name: "Egyptian Red Crescent", number: "02-26703979", type: "ngo", description: "Humanitarian aid" },
    ],
  },
  {
    country: "Iran", code: "IR",
    contacts: [
      { name: "Emergency", number: "115", type: "government", description: "Medical emergency" },
      { name: "Police", number: "110", type: "government", description: "Police emergency" },
      { name: "Fire", number: "125", type: "government", description: "Fire department" },
      { name: "Iranian Red Crescent", number: "112", type: "ngo", description: "Disaster relief" },
    ],
  },
  {
    country: "Kenya", code: "KE",
    contacts: [
      { name: "Emergency", number: "999", type: "government", description: "Police, Fire, Ambulance" },
      { name: "St John Ambulance", number: "0800-723-253", type: "ngo", description: "Emergency medical" },
      { name: "Kenya Red Cross", number: "1199", type: "ngo", description: "Disaster response" },
    ],
  },
  {
    country: "Bangladesh", code: "BD",
    contacts: [
      { name: "Emergency", number: "999", type: "government", description: "Unified emergency" },
      { name: "Fire", number: "199", type: "government", description: "Fire department" },
      { name: "Bangladesh Red Crescent", number: "02-9116563", type: "ngo", description: "Disaster relief" },
    ],
  },
  {
    country: "Saudi Arabia", code: "SA",
    contacts: [
      { name: "Emergency", number: "911", type: "government", description: "Unified emergency" },
      { name: "Civil Defense", number: "998", type: "government", description: "Fire and rescue" },
      { name: "Saudi Red Crescent", number: "997", type: "ngo", description: "Medical emergency" },
    ],
  },
  {
    country: "UAE", code: "AE",
    contacts: [
      { name: "Emergency", number: "999", type: "government", description: "Police emergency" },
      { name: "Ambulance", number: "998", type: "government", description: "Medical emergency" },
      { name: "Fire", number: "997", type: "government", description: "Fire department" },
      { name: "Emirates Red Crescent", number: "800-733", type: "ngo", description: "Humanitarian aid" },
    ],
  },
  {
    country: "Israel", code: "IL",
    contacts: [
      { name: "Police", number: "100", type: "government", description: "Police emergency" },
      { name: "Magen David Adom", number: "101", type: "ngo", description: "Ambulance and first aid" },
      { name: "Fire", number: "102", type: "government", description: "Fire department" },
      { name: "Home Front Command", number: "104", type: "government", description: "Civil defense alerts" },
    ],
  },
  {
    country: "Spain", code: "ES",
    contacts: [
      { name: "Emergency", number: "112", type: "government", description: "Unified emergency" },
      { name: "Police", number: "091", type: "government", description: "National Police" },
      { name: "Cruz Roja", number: "900-221-122", type: "ngo", description: "Spanish Red Cross" },
    ],
  },
];

export const getContactsByCountry = (country: string): CountryContacts | undefined =>
  emergencyContactsByCountry.find(
    (c) => c.country.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase()
  );
