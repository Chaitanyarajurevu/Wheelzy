export interface Vehicle {
  id: string;
  name: string;
  model: string;
  category: "Bike" | "Scooter";
  vehicleType: "Electric Scooter" | "Hybrid Bicycle" | "Motor Scooter" | "Motorcycle";
  campus: string;
  distance: string;
  hourlyPrice: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isAvailable: boolean;
  owner: {
    name: string;
    verifiedStudent: boolean;
    college: string;
    avatarUrl: string;
    badge: string;
  };
  features: string[];
}

export const CAMPUS_OPTIONS = [
  "UC Berkeley",
  "Stanford University",
  "UCLA",
  "MIT / Harvard",
  "UT Austin",
  "University of Michigan",
  "UW Seattle",
  "NYU Manhattan",
] as const;

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    name: "Xiaomi Mi Electric Pro 2",
    model: "Pro 2 Electric (45km range)",
    category: "Scooter",
    vehicleType: "Electric Scooter",
    campus: "UC Berkeley",
    distance: "0.4 miles away",
    hourlyPrice: 3.5,
    rating: 4.9,
    reviewCount: 24,
    imageUrl: "/scooter_xiaomi.jpg",
    isAvailable: true,
    owner: {
      name: "Marcus Vance",
      verifiedStudent: true,
      college: "UC Berkeley · Engineering '27",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Student Owner",
    },
    features: ["Dual braking", "Helmet included", "45km Range", "Phone mount"],
  },
  {
    id: "v2",
    name: "Trek FX 2 Disc",
    model: "Commuter Hybrid 24-Speed",
    category: "Bike",
    vehicleType: "Hybrid Bicycle",
    campus: "UC Berkeley",
    distance: "0.4 miles away",
    hourlyPrice: 5.0,
    rating: 4.9,
    reviewCount: 24,
    imageUrl: "/bike_trek.jpg",
    isAvailable: true,
    owner: {
      name: "Sophia Lin",
      verifiedStudent: true,
      college: "UC Berkeley · Business '26",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Student Owner",
    },
    features: ["Hydraulic Disc Brakes", "Rear Cargo Rack", "Kryptonite U-Lock", "Front LED"],
  },
  {
    id: "v3",
    name: "Honda Activa 6G",
    model: "110cc Smart Key Edition",
    category: "Scooter",
    vehicleType: "Motor Scooter",
    campus: "UC Berkeley",
    distance: "0.5 miles away",
    hourlyPrice: 4.5,
    rating: 4.8,
    reviewCount: 31,
    imageUrl: "/scooter_activa.jpg",
    isAvailable: true,
    owner: {
      name: "Aarav Sharma",
      verifiedStudent: true,
      college: "UC Berkeley · EECS '25",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Student Owner",
    },
    features: ["Full Tank Provided", "ISI Certified Helmet", "Mobile USB Port", "Underseat Boot"],
  },
  {
    id: "v4",
    name: "Royal Enfield Hunter 350",
    model: "Dapper Grey 350cc Roadster",
    category: "Bike",
    vehicleType: "Motorcycle",
    campus: "Stanford University",
    distance: "0.8 miles away",
    hourlyPrice: 7.5,
    rating: 5.0,
    reviewCount: 19,
    imageUrl: "/bike_hunter.jpg",
    isAvailable: true,
    owner: {
      name: "Devon Miller",
      verifiedStudent: true,
      college: "Stanford · Mechanical Eng '25",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Student Owner",
    },
    features: ["Dual-Channel ABS", "Tripper Navigation", "ECE Rated Helmet", "Highway Certified"],
  },
  {
    id: "v5",
    name: "TVS Jupiter 125",
    model: "Disc with SmartXonnect",
    category: "Scooter",
    vehicleType: "Motor Scooter",
    campus: "UCLA",
    distance: "0.6 miles away",
    hourlyPrice: 4.0,
    rating: 4.9,
    reviewCount: 17,
    imageUrl: "/scooter_jupiter.jpg",
    isAvailable: true,
    owner: {
      name: "Priya Nair",
      verifiedStudent: true,
      college: "UCLA · Life Sciences '26",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Student Owner",
    },
    features: ["33L Huge Storage", "External Fuel Fill", "Dual Helmet Hooks", "LED Headlamp"],
  },
  {
    id: "v6",
    name: "TVS Raider 125",
    model: "Sport Streetfighter Edition",
    category: "Bike",
    vehicleType: "Motorcycle",
    campus: "MIT / Harvard",
    distance: "0.9 miles away",
    hourlyPrice: 6.0,
    rating: 4.8,
    reviewCount: 22,
    imageUrl: "/bike_raider.jpg",
    isAvailable: true,
    owner: {
      name: "Karan Patel",
      verifiedStudent: true,
      college: "MIT · Robotics '26",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      badge: "Verified Student Owner",
    },
    features: ["Color TFT Screen", "Eco & Power Modes", "Disc Brakes", "Included Helmet"],
  },
];
