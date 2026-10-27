export interface User {
  id: string;
  name: string;
  email: string;
  role: "system_admin" | "owner" | "renter";
  campus: string;
  collegeYear?: string;
  avatar: string;
  phone: string;
  studentVerified: boolean;
  licenseVerified: boolean;
  aadhaarVerified: boolean;
  studentIdCardUrl?: string;
  studentIdNumber?: string;
  aadhaarCardUrl?: string;
  aadhaarNumber?: string;
  drivingLicenseNumber?: string;
  drivingLicenseUrl?: string;
  drivingLicenseExpiry?: string;
  status: "active" | "suspended";
  joinedDate: string;
}

export interface VehicleDocument {
  rcNumber: string;
  rcMinioKey?: string;
  insuranceExpiry: string;
  insuranceMinioKey?: string;
  verified: boolean;
}

export interface StoredVehicle {
  id: string;
  name: string;
  model: string;
  category: "Bike" | "Scooter";
  vehicleType: "Electric Scooter" | "Hybrid Bicycle" | "Motor Scooter" | "Motorcycle";
  campus: string;
  locationHub: string;
  hourlyPrice: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isAvailable: boolean;
  status: "approved" | "pending_approval" | "rejected" | "maintenance";
  ownerId: string;
  ownerName: string;
  ownerCollege: string;
  ownerAvatar: string;
  features: string[];
  documents?: VehicleDocument;
  createdDate: string;
  availableFromDate?: string;
  availableFromTime?: string;
  returnDate?: string;
  returnTime?: string;
  availableFrom?: string;
  mustReturnBy?: string;
}

export interface StoredBooking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleModel: string;
  vehicleImage: string;
  vehicleType: string;
  category: "Bike" | "Scooter";
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  renterId: string;
  renterName: string;
  renterCampus: string;
  renterAvatar: string;
  campusHub: string;
  pickupTime: string;
  dropoffTime: string;
  durationHours: number;
  hourlyRate: number;
  insuranceFee: number;
  studentDiscount: number;
  totalCost: number;
  status: "pending" | "approved" | "confirmed" | "active" | "overdue" | "returned" | "completed" | "cancelled" | "rejected";
  mandatoryReturnDeadline?: string;
  isOverdue?: boolean;
  overdueReason?: string;
  isReportedOverdue?: boolean;
  reportedOverdueAt?: string;
  digitalUnlockCode?: string;
  renterStudentIdUrl?: string;
  renterStudentIdNumber?: string;
  renterAadhaarUrl?: string;
  renterAadhaarNumber?: string;
  renterStudentVerified?: boolean;
  renterAadhaarVerified?: boolean;
  returnPhotoMinioKey?: string;
  returnPhotoUrl?: string;
  returnNotes?: string;
  returnTimestamp?: string;
  returnPhotoTimestamp?: string;
  actualStartTime?: string;
  actualReturnTime?: string;
  platformFee?: number;
  depositAmount?: number;
  cancellationReason?: string;
  rejectionReason?: string;
  vehicleRegistrationNumber?: string;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userRole: "renter" | "owner" | "system_admin";
  campus: string;
  type: "student_id" | "driving_license" | "vehicle_rc";
  targetVehicleId?: string;
  documentTitle: string;
  idNumber: string;
  documentUrl: string;
  minioKey: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  notes?: string;
  studentIdNumber?: string;
  studentIdUrl?: string;
  studentVerified?: boolean;
  aadhaarNumber?: string;
  aadhaarUrl?: string;
  aadhaarVerified?: boolean;
  drivingLicenseNumber?: string;
  drivingLicenseUrl?: string;
  licenseVerified?: boolean;
  vehicleName?: string;
  vehicleModel?: string;
  vehicleImageUrl?: string;
  rcNumber?: string;
  insuranceExpiry?: string;
}

export interface IncidentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole: "owner" | "renter" | "system_admin";
  targetType: "booking" | "vehicle" | "user" | "hub";
  targetId: string;
  category: "Vehicle Damage" | "Late Return" | "Billing Dispute" | "Safety Concern" | "Hub Facility";
  description: string;
  status: "open" | "in_investigation" | "resolved";
  createdAt: string;
  resolutionNotes?: string;
}

export interface PlatformNotification {
  id: string;
  recipientId: string;
  recipientRole: "system_admin" | "owner" | "renter" | "all";
  title: string;
  message: string;
  type: "booking" | "verification" | "system" | "warning";
  timestamp: string;
  read: boolean;
  actionHref?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: "info" | "warning" | "critical";
}

// Initial seed data
const SEED_USERS: User[] = [
  {
    id: "usr-admin",
    name: "Alex Rivera",
    email: "admin@wheelzy.internal",
    role: "system_admin",
    campus: "Wheelzy HQ",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (510) 555-0199",
    studentVerified: true,
    licenseVerified: true,
    aadhaarVerified: true,
    studentIdNumber: "SID-FACULTY-01",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-1100",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    drivingLicenseNumber: "DL-CA-0010992",
    drivingLicenseUrl: "/driving_license_proof.svg",
    drivingLicenseExpiry: "2035-10-12",
    status: "active",
    joinedDate: "2025-08-01",
  },
  {
    id: "usr-owner-marcus",
    name: "Marcus Vance",
    email: "owner@campus.edu",
    role: "owner",
    campus: "UC Berkeley",
    collegeYear: "EECS '27",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (510) 842-1200",
    studentVerified: true,
    licenseVerified: true,
    aadhaarVerified: true,
    studentIdNumber: "SID-UCB-77102",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-4410",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    drivingLicenseNumber: "DL-CA-7710928",
    drivingLicenseUrl: "/driving_license_proof.svg",
    drivingLicenseExpiry: "2032-04-18",
    status: "active",
    joinedDate: "2026-01-15",
  },
  {
    id: "usr-renter-priya",
    name: "Priya Nair",
    email: "renter@campus.edu",
    role: "renter",
    campus: "UC Berkeley",
    collegeYear: "Bioengineering '26",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (510) 662-8821",
    studentVerified: true,
    licenseVerified: true,
    aadhaarVerified: true,
    studentIdNumber: "SID-UCB-2024-99214",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-9021",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    drivingLicenseNumber: "DL-CA-4491028",
    drivingLicenseUrl: "/driving_license_proof.svg",
    drivingLicenseExpiry: "2031-11-20",
    status: "active",
    joinedDate: "2026-02-10",
  },
  {
    id: "usr-renter-devon",
    name: "Devon Clark",
    email: "devon@stanford.edu",
    role: "renter",
    campus: "Stanford University",
    collegeYear: "Economics '26",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (650) 412-9901",
    studentVerified: true,
    licenseVerified: false,
    aadhaarVerified: true,
    studentIdNumber: "SID-STAN-4481",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-1144",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    drivingLicenseNumber: "DL-CA-9921448",
    drivingLicenseUrl: "/driving_license_proof.svg",
    drivingLicenseExpiry: "2030-08-15",
    status: "active",
    joinedDate: "2026-03-01",
  },
  {
    id: "usr-owner-elena",
    name: "Elena Rostova",
    email: "elena@stanford.edu",
    role: "owner",
    campus: "Stanford University",
    collegeYear: "Materials Science '25",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (650) 773-1992",
    studentVerified: true,
    licenseVerified: true,
    aadhaarVerified: true,
    studentIdNumber: "SID-STAN-8819",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-5522",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    drivingLicenseNumber: "DL-STF-338190",
    drivingLicenseUrl: "/driving_license_proof.svg",
    drivingLicenseExpiry: "2031-06-25",
    status: "active",
    joinedDate: "2026-02-20",
  },
  {
    id: "usr-rohan",
    name: "Rohan Patel",
    email: "rohan@berkeley.edu",
    role: "renter",
    campus: "UC Berkeley",
    collegeYear: "Mechanical '28",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (510) 331-8840",
    studentVerified: false,
    licenseVerified: false,
    aadhaarVerified: false,
    studentIdNumber: "SID-UCB-33120",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-8821",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    drivingLicenseNumber: "DL-CA-4418290",
    drivingLicenseUrl: "/driving_license_proof.svg",
    drivingLicenseExpiry: "2033-09-10",
    status: "active",
    joinedDate: "2026-10-14",
  },
  {
    id: "usr-suspended-jordan",
    name: "Jordan Lee",
    email: "suspended@campus.edu",
    role: "renter",
    campus: "UC Berkeley",
    collegeYear: "Undeclared '27",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: "+1 (510) 999-0000",
    studentVerified: false,
    licenseVerified: false,
    aadhaarVerified: false,
    studentIdNumber: "SID-UCB-11990",
    studentIdCardUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-9999",
    aadhaarCardUrl: "/aadhaar_card_proof.svg",
    status: "suspended",
    joinedDate: "2026-01-05",
  },
];

const SEED_VEHICLES: StoredVehicle[] = [
  {
    id: "v1",
    name: "Xiaomi Mi Electric Pro 2",
    model: "Pro 2 Electric (45km range)",
    category: "Scooter",
    vehicleType: "Electric Scooter",
    campus: "UC Berkeley",
    locationHub: "Moffitt Library Hub",
    hourlyPrice: 3.5,
    rating: 4.9,
    reviewCount: 24,
    imageUrl: "/scooter_xiaomi.jpg",
    isAvailable: true,
    status: "approved",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerCollege: "UC Berkeley · EECS '27",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    features: ["Dual braking", "Helmet included", "45km Range", "Phone mount"],
    documents: {
      rcNumber: "CA-EBIKE-88192",
      rcMinioKey: "minio://wheelzy-docs/vehicles/rc_v1.pdf",
      insuranceExpiry: "2027-05-15",
      verified: true,
    },
    createdDate: "2026-01-20",
    availableFromDate: "2026-10-28",
    availableFromTime: "09:00 AM",
    returnDate: "2026-10-28",
    returnTime: "06:00 PM",
    availableFrom: "28 October 2026, 9:00 AM",
    mustReturnBy: "28 October 2026, 6:00 PM",
  },
  {
    id: "v2",
    name: "Trek FX 2 Disc",
    model: "Commuter Hybrid 24-Speed",
    category: "Bike",
    vehicleType: "Hybrid Bicycle",
    campus: "UC Berkeley",
    locationHub: "Sproul Plaza Hub",
    hourlyPrice: 5.0,
    rating: 4.9,
    reviewCount: 24,
    imageUrl: "/bike_trek.jpg",
    isAvailable: true,
    status: "approved",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerCollege: "UC Berkeley · EECS '27",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    features: ["Hydraulic Disc Brakes", "Rear Cargo Rack", "Kryptonite U-Lock", "Front LED"],
    documents: {
      rcNumber: "CYCLE-TRK-9902",
      rcMinioKey: "minio://wheelzy-docs/vehicles/rc_v2.pdf",
      insuranceExpiry: "2027-08-30",
      verified: true,
    },
    createdDate: "2026-02-01",
    availableFromDate: "2026-10-28",
    availableFromTime: "08:00 AM",
    returnDate: "2026-10-28",
    returnTime: "08:00 PM",
    availableFrom: "28 October 2026, 8:00 AM",
    mustReturnBy: "28 October 2026, 8:00 PM",
  },
  {
    id: "v3",
    name: "Honda Activa 6G",
    model: "110cc Smart Key Edition",
    category: "Scooter",
    vehicleType: "Motor Scooter",
    campus: "UC Berkeley",
    locationHub: "RSF Gymnasium Hub",
    hourlyPrice: 4.5,
    rating: 4.8,
    reviewCount: 31,
    imageUrl: "/scooter_activa.jpg",
    isAvailable: true,
    status: "approved",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerCollege: "UC Berkeley · EECS '27",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    features: ["Full Tank Provided", "ISI Certified Helmet", "Mobile USB Port", "Underseat Boot"],
    documents: {
      rcNumber: "CAL-MOT-33411",
      rcMinioKey: "minio://wheelzy-docs/vehicles/rc_v3.pdf",
      insuranceExpiry: "2027-03-10",
      verified: true,
    },
    createdDate: "2026-02-15",
    availableFromDate: "2026-10-28",
    availableFromTime: "10:00 AM",
    returnDate: "2026-10-28",
    returnTime: "01:00 PM",
    availableFrom: "28 October 2026, 10:00 AM",
    mustReturnBy: "28 October 2026, 1:00 PM",
  },
  {
    id: "v4",
    name: "TVS Jupiter 125",
    model: "i-Touch Start 125cc",
    category: "Scooter",
    vehicleType: "Motor Scooter",
    campus: "UC Berkeley",
    locationHub: "Hearst Memorial Mining Hub",
    hourlyPrice: 4.0,
    rating: 4.7,
    reviewCount: 19,
    imageUrl: "/scooter_jupiter.jpg",
    isAvailable: true,
    status: "approved",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerCollege: "UC Berkeley · EECS '27",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    features: ["Largest Underseat Space", "All-in-one Ignition", "External Fuel Fill", "Eco Thrust Engine"],
    documents: {
      rcNumber: "CAL-MOT-44910",
      rcMinioKey: "minio://wheelzy-docs/vehicles/rc_v4.pdf",
      insuranceExpiry: "2027-04-20",
      verified: true,
    },
    createdDate: "2026-03-01",
    availableFromDate: "2026-10-28",
    availableFromTime: "11:00 AM",
    returnDate: "2026-10-28",
    returnTime: "04:00 PM",
    availableFrom: "28 October 2026, 11:00 AM",
    mustReturnBy: "28 October 2026, 4:00 PM",
  },
  {
    id: "v5",
    name: "Royal Enfield Hunter 350",
    model: "Dapper Ash 349cc",
    category: "Bike",
    vehicleType: "Motorcycle",
    campus: "UC Berkeley",
    locationHub: "Sproul Plaza Hub",
    hourlyPrice: 8.0,
    rating: 5.0,
    reviewCount: 42,
    imageUrl: "/bike_hunter.jpg",
    isAvailable: false, // Currently on active rental by Priya Nair
    status: "approved",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerCollege: "UC Berkeley · EECS '27",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    features: ["Dual Channel ABS", "Digi-Analog Instrument", "Tripper Navigation", "ECE Approved Helmet"],
    documents: {
      rcNumber: "CAL-BIKE-5521",
      rcMinioKey: "minio://wheelzy-docs/vehicles/rc_v5.pdf",
      insuranceExpiry: "2027-09-15",
      verified: true,
    },
    createdDate: "2026-03-10",
    availableFromDate: "2026-10-28",
    availableFromTime: "01:00 PM",
    returnDate: "2026-10-28",
    returnTime: "05:00 PM",
    availableFrom: "28 October 2026, 1:00 PM",
    mustReturnBy: "28 October 2026, 5:00 PM",
  },
  {
    id: "v6",
    name: "TVS Raider 125",
    model: "Wicked Black 125cc (SmartXonnect)",
    category: "Bike",
    vehicleType: "Motorcycle",
    campus: "Stanford University",
    locationHub: "Stanford Oval Hub",
    hourlyPrice: 5.5,
    rating: 4.8,
    reviewCount: 12,
    imageUrl: "/bike_raider.jpg",
    isAvailable: false,
    status: "pending_approval",
    ownerId: "usr-owner-elena",
    ownerName: "Elena Rostova",
    ownerCollege: "Stanford University · Grad '25",
    ownerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    features: ["TFT Display", "Riding Modes (Eco/Power)", "Gas-charged Monoshock", "USB Charger"],
    documents: {
      rcNumber: "STF-MTR-9081",
      rcMinioKey: "minio://wheelzy-docs/vehicles/rc_v6.pdf",
      insuranceExpiry: "2027-11-05",
      verified: false,
    },
    createdDate: "2026-03-15",
    availableFromDate: "2026-10-28",
    availableFromTime: "10:00 AM",
    returnDate: "2026-10-28",
    returnTime: "06:00 PM",
    availableFrom: "28 October 2026, 10:00 AM",
    mustReturnBy: "28 October 2026, 6:00 PM",
  },
];

const SEED_BOOKINGS: StoredBooking[] = [
  {
    id: "BK-8021",
    vehicleId: "v5",
    vehicleName: "Royal Enfield Hunter 350",
    vehicleModel: "Dapper Ash 349cc",
    vehicleImage: "/bike_hunter.jpg",
    vehicleType: "Motorcycle",
    category: "Bike",
    vehicleRegistrationNumber: "CA-HUN-350",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    renterId: "usr-renter-priya",
    renterName: "Priya Nair",
    renterCampus: "UC Berkeley · Bioengineering '26",
    renterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    renterStudentIdUrl: "/student_id_proof.svg",
    renterStudentIdNumber: "SID-UCB-2024-99214",
    renterAadhaarUrl: "/aadhaar_card_proof.svg",
    renterAadhaarNumber: "XXXX-XXXX-9021",
    renterStudentVerified: true,
    renterAadhaarVerified: true,
    campusHub: "UC Berkeley (Sproul Plaza Hub)",
    pickupTime: "Today, 1:00 PM",
    dropoffTime: "Today, 5:00 PM",
    mandatoryReturnDeadline: "28 October 2026, 5:00 PM",
    durationHours: 4,
    hourlyRate: 8.0,
    insuranceFee: 3.0,
    studentDiscount: 2.0,
    platformFee: 2.5,
    depositAmount: 15.0,
    totalCost: 33.0,
    status: "active",
    actualStartTime: "Today, 1:05 PM",
    digitalUnlockCode: "WHZ-9281",
    createdAt: "2026-10-15T07:30:00Z",
  },
  {
    id: "BK-8019",
    vehicleId: "v4",
    vehicleName: "TVS Jupiter 125",
    vehicleModel: "i-Touch Start 125cc",
    vehicleImage: "/scooter_jupiter.jpg",
    vehicleType: "Motor Scooter",
    category: "Scooter",
    vehicleRegistrationNumber: "CAL-MOT-44910",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    renterId: "usr-rohan",
    renterName: "Rohan Patel",
    renterCampus: "UC Berkeley · Mechanical '28",
    renterAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    renterStudentIdUrl: "/student_id_proof.svg",
    renterStudentIdNumber: "SID-UCB-33120",
    renterAadhaarUrl: "/aadhaar_card_proof.svg",
    renterAadhaarNumber: "XXXX-XXXX-8821",
    renterStudentVerified: true,
    renterAadhaarVerified: true,
    campusHub: "Hearst Memorial Mining Hub",
    pickupTime: "Today, 10:00 AM",
    dropoffTime: "Today, 1:00 PM",
    mandatoryReturnDeadline: "28 October 2026, 1:00 PM",
    durationHours: 3,
    hourlyRate: 4.0,
    insuranceFee: 2.0,
    studentDiscount: 1.5,
    platformFee: 1.5,
    depositAmount: 10.0,
    totalCost: 14.0,
    status: "overdue",
    isOverdue: true,
    overdueReason: "Mandatory return deadline (1:00 PM) passed without confirmed dropoff inspection.",
    digitalUnlockCode: "WHZ-3319",
    createdAt: "2026-10-15T04:00:00Z",
  },
  {
    id: "BK-8022",
    vehicleId: "v1",
    vehicleName: "Xiaomi Mi Electric Pro 2",
    vehicleModel: "Pro 2 Electric (45km range)",
    vehicleImage: "/scooter_xiaomi.jpg",
    vehicleType: "Electric Scooter",
    category: "Scooter",
    vehicleRegistrationNumber: "CA-EBIKE-88192",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    renterId: "usr-renter-devon",
    renterName: "Devon Clark",
    renterCampus: "Stanford University · Economics '26",
    renterAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    renterStudentIdUrl: "/student_id_proof.svg",
    renterStudentIdNumber: "SID-STAN-4481",
    renterAadhaarUrl: "/aadhaar_card_proof.svg",
    renterAadhaarNumber: "XXXX-XXXX-1144",
    renterStudentVerified: true,
    renterAadhaarVerified: true,
    campusHub: "UC Berkeley (Moffitt Library Hub)",
    pickupTime: "Today, 2:00 PM",
    dropoffTime: "Today, 6:00 PM",
    mandatoryReturnDeadline: "28 October 2026, 6:00 PM",
    durationHours: 4,
    hourlyRate: 3.5,
    insuranceFee: 2.0,
    studentDiscount: 1.5,
    platformFee: 2.0,
    depositAmount: 10.0,
    totalCost: 16.5,
    status: "pending",
    createdAt: "2026-10-15T06:15:00Z",
  },
  {
    id: "BK-8023",
    vehicleId: "v4",
    vehicleName: "TVS Jupiter 125",
    vehicleModel: "i-Touch Start 125cc",
    vehicleImage: "/scooter_jupiter.jpg",
    vehicleType: "Motor Scooter",
    category: "Scooter",
    vehicleRegistrationNumber: "CAL-MOT-44910",
    ownerId: "usr-owner-marcus",
    ownerName: "Marcus Vance",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    renterId: "usr-rohan",
    renterName: "Rohan Patel",
    renterCampus: "UC Berkeley · Mechanical '28",
    renterAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    renterStudentIdUrl: "/student_id_proof.svg",
    renterStudentIdNumber: "SID-UCB-33120",
    renterAadhaarUrl: "/aadhaar_card_proof.svg",
    renterAadhaarNumber: "XXXX-XXXX-8821",
    renterStudentVerified: true,
    renterAadhaarVerified: true,
    campusHub: "UC Berkeley (Hearst Mining Hub)",
    pickupTime: "Today, 10:00 AM",
    dropoffTime: "Today, 1:00 PM",
    mandatoryReturnDeadline: "28 October 2026, 1:00 PM",
    durationHours: 3,
    hourlyRate: 4.0,
    insuranceFee: 2.0,
    studentDiscount: 1.5,
    platformFee: 1.5,
    depositAmount: 10.0,
    totalCost: 12.5,
    status: "returned",
    actualStartTime: "Today, 10:02 AM",
    actualReturnTime: "Today, 12:55 PM",
    returnPhotoTimestamp: "Today, 12:55 PM",
    digitalUnlockCode: "WHZ-4109",
    returnPhotoMinioKey: "minio://wheelzy-media/returns/ret_bk8023_parked.webp",
    returnPhotoUrl: "/card_return.jpg",
    returnNotes: "Locked safely at Bay 3 bike stand. Key left in campus secure dropbox. Helmet placed in boot.",
    returnTimestamp: "Today, 12:55 PM",
    createdAt: "2026-10-15T04:20:00Z",
  },
];

const SEED_VERIFICATIONS: VerificationRequest[] = [
  {
    id: "ver-1",
    userId: "usr-rohan",
    userName: "Rohan Patel",
    userEmail: "rohan@berkeley.edu",
    userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    userRole: "renter",
    campus: "UC Berkeley",
    type: "student_id",
    documentTitle: "Student ID Card",
    idNumber: "SID-UCB-33120",
    documentUrl: "/student_id_proof.svg",
    minioKey: "minio://wheelzy-docs/kyc/sid_rohan_2026.pdf",
    status: "pending",
    submittedAt: "10 mins ago",
    notes: "Freshman mechanical engineering student ID verification",
    studentIdNumber: "SID-UCB-33120",
    studentIdUrl: "/student_id_proof.svg",
    aadhaarNumber: "XXXX-XXXX-8821",
    aadhaarUrl: "/aadhaar_card_proof.svg",
  },
  {
    id: "ver-2",
    userId: "usr-owner-elena",
    userName: "Elena Rostova",
    userEmail: "elena@stanford.edu",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    userRole: "owner",
    campus: "Stanford University",
    type: "vehicle_rc",
    targetVehicleId: "v6",
    documentTitle: "Vehicle RC & Insurance (TVS Raider)",
    idNumber: "STF-MTR-9081",
    documentUrl: "/bike_raider.jpg",
    minioKey: "minio://wheelzy-docs/vehicles/rc_v6.pdf",
    status: "pending",
    submittedAt: "2 hours ago",
    notes: "Requires campus roadworthiness and digital registration audit",
    vehicleName: "TVS Raider 125",
    vehicleModel: "Wicked Black 125cc",
    rcNumber: "STF-MTR-9081",
    insuranceExpiry: "2027-11-05",
  },
];

const SEED_REPORTS: IncidentReport[] = [
  {
    id: "rep-101",
    reporterId: "usr-owner-marcus",
    reporterName: "Marcus Vance",
    reporterRole: "owner",
    targetType: "booking",
    targetId: "BK-8019",
    category: "Late Return",
    description: "Renter exceeded mandatory return window (1:00 PM) without completing hub return.",
    status: "open",
    createdAt: "Today, 1:15 PM",
  },
];

const SEED_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: "notif-1",
    recipientId: "usr-owner-marcus",
    recipientRole: "owner",
    title: "New Booking Request",
    message: "Devon Clark requested Xiaomi Mi Electric Pro 2 for 4 hours.",
    type: "booking",
    timestamp: "10 mins ago",
    read: false,
    actionHref: "/owner/booking-requests",
  },
  {
    id: "notif-2",
    recipientId: "usr-renter-priya",
    recipientRole: "renter",
    title: "Active Ride In Progress",
    message: "Your ride with Royal Enfield Hunter 350 is active. Must return by 5:00 PM.",
    type: "booking",
    timestamp: "2 hours ago",
    read: true,
    actionHref: "/renter/active-rides",
  },
];

const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "aud-101",
    timestamp: "2026-10-15 13:12:00",
    actorName: "Priya Nair",
    actorRole: "renter",
    action: "BOOKING_UNLOCK_GENERATED",
    target: "BK-8021 / Royal Enfield Hunter 350",
    ipAddress: "128.32.110.42 (UC Berkeley WiFi)",
    severity: "info",
  },
];

// Local Storage helpers
const STORAGE_KEYS = {
  USERS: "wheelzy_users_v6",
  VEHICLES: "wheelzy_vehicles_v6",
  BOOKINGS: "wheelzy_bookings_v6",
  VERIFICATIONS: "wheelzy_verifications_v6",
  REPORTS: "wheelzy_reports_v6",
  NOTIFICATIONS: "wheelzy_notifications_v6",
  AUDIT_LOGS: "wheelzy_audit_logs_v6",
};

function loadData<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function saveData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("wheelzy-store-update", { detail: { key } }));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

// DataStore API
export const dataStore = {
  // Users
  getUsers(): User[] {
    return loadData<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },
  toggleUserStatus(userId: string): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return undefined;
    users[idx].status = users[idx].status === "active" ? "suspended" : "active";
    saveData(STORAGE_KEYS.USERS, users);
    this.addAuditLog("Admin", "system_admin", `USER_STATUS_TOGGLED: ${users[idx].name} -> ${users[idx].status}`, userId);
    return users[idx];
  },
  registerUser(newUser: {
    name: string;
    email: string;
    role: "owner" | "renter";
    campus: string;
    collegeYear?: string;
    phone: string;
    avatar?: string;
  }): User {
    const users = this.getUsers();
    const created: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: newUser.name,
      email: newUser.email.toLowerCase(),
      role: newUser.role,
      campus: newUser.campus,
      collegeYear: newUser.collegeYear || "Student '27",
      avatar: newUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      phone: newUser.phone,
      studentVerified: false,
      licenseVerified: false,
      aadhaarVerified: false,
      studentIdNumber: "SID-" + Math.floor(100000 + Math.random() * 900000),
      studentIdCardUrl: "/student_id_proof.svg",
      aadhaarNumber: "XXXX-XXXX-" + Math.floor(1000 + Math.random() * 9000),
      aadhaarCardUrl: "/aadhaar_card_proof.svg",
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
    };
    users.push(created);
    saveData(STORAGE_KEYS.USERS, users);
    this.addAuditLog(created.name, created.role, `USER_REGISTERED: New student account created as ${created.role}`, created.id);
    return created;
  },
  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...updates };
    saveData(STORAGE_KEYS.USERS, users);
    this.addAuditLog(users[idx].name, users[idx].role, `USER_PROFILE_UPDATED: ${Object.keys(updates).join(", ")}`, userId);
    return users[idx];
  },
  uploadUserDocuments(
    userId: string,
    docs: {
      studentIdCardUrl?: string;
      studentIdNumber?: string;
      aadhaarCardUrl?: string;
      aadhaarNumber?: string;
      drivingLicenseUrl?: string;
      drivingLicenseNumber?: string;
      drivingLicenseExpiry?: string;
      studentVerified?: boolean;
      licenseVerified?: boolean;
      aadhaarVerified?: boolean;
    }
  ): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return undefined;

    users[idx] = {
      ...users[idx],
      ...docs,
      studentVerified: docs.studentVerified ?? true,
      licenseVerified: docs.licenseVerified ?? Boolean(docs.drivingLicenseNumber),
      aadhaarVerified: docs.aadhaarVerified ?? true,
    };
    saveData(STORAGE_KEYS.USERS, users);
    this.addAuditLog(users[idx].name, users[idx].role, "KYC_DOCUMENTS_UPLOADED: Student ID and Aadhaar card updated", userId);
    return users[idx];
  },

  // Vehicles
  getVehicles(): StoredVehicle[] {
    const list = loadData<StoredVehicle[]>(STORAGE_KEYS.VEHICLES, SEED_VEHICLES);
    return list.map((v) => {
      if (!v.mustReturnBy) {
        return {
          ...v,
          availableFromDate: v.availableFromDate || "2026-10-28",
          availableFromTime: v.availableFromTime || "10:00 AM",
          returnDate: v.returnDate || "2026-10-28",
          returnTime: v.returnTime || "01:00 PM",
          availableFrom: v.availableFrom || "28 October 2026, 10:00 AM",
          mustReturnBy: v.mustReturnBy || "28 October 2026, 1:00 PM",
        };
      }
      return v;
    });
  },
  getApprovedAvailableVehicles(campus?: string): StoredVehicle[] {
    return this.getVehicles().filter((v) => {
      const isApproved = v.status === "approved";
      const isAvail = v.isAvailable;
      if (!isApproved || !isAvail) return false;
      if (campus && campus !== "" && v.campus !== campus) return false;
      return true;
    });
  },
  getOwnerVehicles(ownerId: string): StoredVehicle[] {
    return this.getVehicles().filter((v) => v.ownerId === ownerId);
  },
  getVehicleById(id: string): StoredVehicle | undefined {
    return this.getVehicles().find((v) => v.id === id);
  },
  addVehicle(newVehicle: Omit<StoredVehicle, "id" | "rating" | "reviewCount" | "createdDate">): StoredVehicle {
    const vehicles = this.getVehicles();
    const created: StoredVehicle = {
      ...newVehicle,
      id: `v${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      availableFrom: newVehicle.availableFrom || `${newVehicle.availableFromDate || "28 October 2026"}, ${newVehicle.availableFromTime || "10:00 AM"}`,
      mustReturnBy: newVehicle.mustReturnBy || `${newVehicle.returnDate || "28 October 2026"}, ${newVehicle.returnTime || "1:00 PM"}`,
    };
    vehicles.unshift(created);
    saveData(STORAGE_KEYS.VEHICLES, vehicles);

    this.createVerification({
      userId: created.ownerId,
      userName: created.ownerName,
      userEmail: "owner@campus.edu",
      userAvatar: created.ownerAvatar,
      userRole: "owner",
      campus: created.campus,
      type: "vehicle_rc",
      targetVehicleId: created.id,
      documentTitle: `RC & Insurance (${created.name})`,
      idNumber: created.documents?.rcNumber || `RC-${created.id}`,
      documentUrl: created.imageUrl,
      minioKey: created.documents?.rcMinioKey || `minio://wheelzy-docs/vehicles/rc_${created.id}.pdf`,
      notes: "Newly listed vehicle submitted for roadworthiness and insurance verification",
    });

    this.addNotification({
      recipientId: "usr-admin",
      recipientRole: "system_admin",
      title: "New Vehicle Listing Submitted",
      message: `${created.ownerName} listed ${created.name}. Verification required before ride is live.`,
      type: "verification",
      actionHref: "/admin/vehicle-verification",
    });

    return created;
  },
  updateVehicleStatus(vehicleId: string, status: StoredVehicle["status"], isAvailable?: boolean): StoredVehicle | undefined {
    const vehicles = this.getVehicles();
    const idx = vehicles.findIndex((v) => v.id === vehicleId);
    if (idx === -1) return undefined;
    vehicles[idx].status = status;
    if (typeof isAvailable === "boolean") {
      vehicles[idx].isAvailable = isAvailable;
    }
    saveData(STORAGE_KEYS.VEHICLES, vehicles);
    return vehicles[idx];
  },
  updateVehiclePricing(vehicleId: string, hourlyPrice: number): StoredVehicle | undefined {
    const vehicles = this.getVehicles();
    const idx = vehicles.findIndex((v) => v.id === vehicleId);
    if (idx === -1) return undefined;
    vehicles[idx].hourlyPrice = hourlyPrice;
    saveData(STORAGE_KEYS.VEHICLES, vehicles);
    return vehicles[idx];
  },
  updateVehicleAvailability(
    vehicleId: string,
    updates: {
      availableFromDate: string;
      availableFromTime: string;
      returnDate: string;
      returnTime: string;
      availableFrom?: string;
      mustReturnBy?: string;
    }
  ): StoredVehicle | undefined {
    const vehicles = this.getVehicles();
    const idx = vehicles.findIndex((v) => v.id === vehicleId);
    if (idx === -1) return undefined;

    vehicles[idx] = {
      ...vehicles[idx],
      ...updates,
      availableFrom: updates.availableFrom || `${updates.availableFromDate}, ${updates.availableFromTime}`,
      mustReturnBy: updates.mustReturnBy || `${updates.returnDate}, ${updates.returnTime}`,
    };
    saveData(STORAGE_KEYS.VEHICLES, vehicles);
    return vehicles[idx];
  },

  // Bookings
  getBookings(): StoredBooking[] {
    return loadData<StoredBooking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
  },
  getOwnerBookings(ownerId: string): StoredBooking[] {
    return this.getBookings().filter((b) => b.ownerId === ownerId);
  },
  getRenterBookings(renterId: string): StoredBooking[] {
    return this.getBookings().filter((b) => b.renterId === renterId);
  },
  getBookingById(id: string): StoredBooking | undefined {
    return this.getBookings().find((b) => b.id === id);
  },
  checkVehicleOverlap(vehicleId: string, startTime: string, returnTime: string): boolean {
    const activeAndApproved = this.getBookings().filter(
      (b) => b.vehicleId === vehicleId && (b.status === "active" || b.status === "approved" || b.status === "confirmed")
    );
    return activeAndApproved.some((b) => b.pickupTime.includes(startTime) || b.dropoffTime.includes(returnTime));
  },
  createBooking(data: {
    vehicle: StoredVehicle;
    renter: User;
    pickupTime: string;
    dropoffTime: string;
    durationHours: number;
    campusHub: string;
    mandatoryReturnDeadline?: string;
  }): StoredBooking {
    const bookings = this.getBookings();
    const hourlyCost = data.vehicle.hourlyPrice * data.durationHours;
    const insuranceFee = 2.0;
    const studentDiscount = 1.5;
    const totalCost = Number((hourlyCost + insuranceFee - studentDiscount).toFixed(2));

    const newBooking: StoredBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: data.vehicle.id,
      vehicleName: data.vehicle.name,
      vehicleModel: data.vehicle.model,
      vehicleImage: data.vehicle.imageUrl,
      vehicleType: data.vehicle.vehicleType,
      category: data.vehicle.category,
      ownerId: data.vehicle.ownerId,
      ownerName: data.vehicle.ownerName,
      ownerAvatar: data.vehicle.ownerAvatar,
      renterId: data.renter.id,
      renterName: data.renter.name,
      renterCampus: data.renter.campus + (data.renter.collegeYear ? ` · ${data.renter.collegeYear}` : ""),
      renterAvatar: data.renter.avatar,
      renterStudentIdUrl: data.renter.studentIdCardUrl || "/student_id_proof.svg",
      renterStudentIdNumber: data.renter.studentIdNumber || "SID-UCB-2024-99214",
      renterAadhaarUrl: data.renter.aadhaarCardUrl || "/aadhaar_card_proof.svg",
      renterAadhaarNumber: data.renter.aadhaarNumber || "XXXX-XXXX-9021",
      renterStudentVerified: data.renter.studentVerified ?? true,
      renterAadhaarVerified: data.renter.aadhaarVerified ?? true,
      campusHub: data.campusHub,
      pickupTime: data.pickupTime,
      dropoffTime: data.dropoffTime,
      mandatoryReturnDeadline: data.mandatoryReturnDeadline || data.vehicle.mustReturnBy || `${data.vehicle.returnDate || "Today"}, ${data.vehicle.returnTime || "1:00 PM"}`,
      durationHours: data.durationHours,
      hourlyRate: data.vehicle.hourlyPrice,
      insuranceFee,
      studentDiscount,
      totalCost,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    saveData(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      recipientId: data.vehicle.ownerId,
      recipientRole: "owner",
      title: "New Booking Request",
      message: `${data.renter.name} requested ${data.vehicle.name} for ${data.durationHours} hrs.`,
      type: "booking",
      actionHref: "/owner/booking-requests",
    });

    return newBooking;
  },
  updateBookingStatus(bookingId: string, status: StoredBooking["status"]): StoredBooking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    bookings[idx].status = status;
    if (status === "active" && !bookings[idx].digitalUnlockCode) {
      bookings[idx].digitalUnlockCode = `WHZ-${Math.floor(1000 + Math.random() * 9000)}`;
      this.updateVehicleStatus(bookings[idx].vehicleId, "approved", false);
    }
    if (status === "completed") {
      this.updateVehicleStatus(bookings[idx].vehicleId, "approved", true);
    }

    saveData(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      recipientId: bookings[idx].renterId,
      recipientRole: "renter",
      title: `Booking Update: ${bookings[idx].vehicleName}`,
      message: `Your booking status changed to ${status.toUpperCase()}.`,
      type: "booking",
      actionHref: "/renter/booking-status",
    });

    return bookings[idx];
  },
  submitReturnPhoto(
    bookingId: string,
    photoUrl: string,
    notes?: string,
    minioKey?: string
  ): StoredBooking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    bookings[idx].status = "returned";
    bookings[idx].returnPhotoUrl = photoUrl;
    bookings[idx].returnPhotoMinioKey = minioKey || `minio://wheelzy-media/returns/ret_${bookingId.toLowerCase()}.webp`;
    bookings[idx].returnNotes = notes || "Vehicle safely parked and locked at campus hub.";
    bookings[idx].returnTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    saveData(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      recipientId: bookings[idx].ownerId,
      recipientRole: "owner",
      title: "Return Photos Ready for Inspection",
      message: `${bookings[idx].renterName} returned ${bookings[idx].vehicleName}. Please review return photos.`,
      type: "booking",
      actionHref: "/owner/return-tracking",
    });

    return bookings[idx];
  },
  reportOverdueRide(bookingId: string, reason?: string): StoredBooking | undefined {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return undefined;

    bookings[idx].status = "overdue";
    bookings[idx].isOverdue = true;
    bookings[idx].isReportedOverdue = true;
    bookings[idx].overdueReason = reason || "Vehicle return deadline passed without hub return confirmation.";
    bookings[idx].reportedOverdueAt = new Date().toISOString();
    saveData(STORAGE_KEYS.BOOKINGS, bookings);

    this.addNotification({
      recipientId: bookings[idx].ownerId,
      recipientRole: "owner",
      title: "Overdue Ride Escalated",
      message: `Your overdue report for ${bookings[idx].vehicleName} (Booking ${bookingId}) has been logged with campus admin.`,
      type: "booking",
      actionHref: "/owner/active-rides",
    });

    this.addNotification({
      recipientId: bookings[idx].renterId,
      recipientRole: "renter",
      title: "URGENT: Return Overdue",
      message: `Your return deadline for ${bookings[idx].vehicleName} has passed. Please lock at the campus hub immediately.`,
      type: "booking",
      actionHref: "/renter/return",
    });

    this.createReport({
      reporterId: bookings[idx].ownerId,
      reporterName: bookings[idx].ownerName,
      reporterRole: "owner",
      targetType: "booking",
      targetId: bookingId,
      category: "Late Return",
      description: reason || `Overdue vehicle return reported by host for ${bookings[idx].vehicleName}.`,
    });

    return bookings[idx];
  },

  // Verifications
  getVerifications(type?: VerificationRequest["type"]): VerificationRequest[] {
    const items = loadData<VerificationRequest[]>(STORAGE_KEYS.VERIFICATIONS, SEED_VERIFICATIONS);
    if (type) return items.filter((item) => item.type === type);
    return items;
  },
  createVerification(req: Omit<VerificationRequest, "id" | "status" | "submittedAt">): VerificationRequest {
    const verifs = this.getVerifications();
    const created: VerificationRequest = {
      ...req,
      id: `ver-${Date.now()}`,
      status: "pending",
      submittedAt: "Just now",
    };
    verifs.unshift(created);
    saveData(STORAGE_KEYS.VERIFICATIONS, verifs);
    return created;
  },
  reviewVerification(id: string, status: "approved" | "rejected", notes?: string): VerificationRequest | undefined {
    const verifs = this.getVerifications();
    const idx = verifs.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;

    verifs[idx].status = status;
    verifs[idx].notes = notes;
    saveData(STORAGE_KEYS.VERIFICATIONS, verifs);

    if (verifs[idx].type === "vehicle_rc" && verifs[idx].targetVehicleId) {
      this.updateVehicleStatus(
        verifs[idx].targetVehicleId!,
        status === "approved" ? "approved" : "rejected",
        status === "approved"
      );
    }

    const users = this.getUsers();
    const userIdx = users.findIndex((u) => u.id === verifs[idx].userId);
    if (userIdx !== -1) {
      if (verifs[idx].type === "student_id" && status === "approved") {
        users[userIdx].studentVerified = true;
      }
      if (verifs[idx].type === "driving_license" && status === "approved") {
        users[userIdx].licenseVerified = true;
      }
      saveData(STORAGE_KEYS.USERS, users);
    }

    this.addNotification({
      recipientId: verifs[idx].userId,
      recipientRole: "renter",
      title: `${verifs[idx].documentTitle} ${status.toUpperCase()}`,
      message: `Your verification request has been ${status} by campus administration.`,
      type: "verification",
      actionHref: "/renter/profile",
    });

    return verifs[idx];
  },

  // Incident Reports
  getReports(): IncidentReport[] {
    return loadData<IncidentReport[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  },
  createReport(report: Omit<IncidentReport, "id" | "status" | "createdAt">): IncidentReport {
    const reports = this.getReports();
    const created: IncidentReport = {
      ...report,
      id: `rep-${Date.now()}`,
      status: "open",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    reports.unshift(created);
    saveData(STORAGE_KEYS.REPORTS, reports);

    this.addAuditLog(created.reporterName, created.reporterRole, `REPORT_FILED: [${created.category}] on ${created.targetType} ${created.targetId}`, created.id);
    return created;
  },
  resolveReport(reportId: string, notes: string): IncidentReport | undefined {
    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) return undefined;

    reports[idx].status = "resolved";
    reports[idx].resolutionNotes = notes;
    saveData(STORAGE_KEYS.REPORTS, reports);
    return reports[idx];
  },

  // Notifications
  getNotifications(role?: string, userId?: string): PlatformNotification[] {
    const all = loadData<PlatformNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    return all.filter((n) => {
      if (userId && n.recipientId === userId) return true;
      if (role && (n.recipientRole === role || n.recipientRole === "all")) return true;
      return false;
    });
  },
  addNotification(notif: Omit<PlatformNotification, "id" | "timestamp" | "read">): PlatformNotification {
    const notifs = loadData<PlatformNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const created: PlatformNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: "Just now",
      read: false,
    };
    notifs.unshift(created);
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return created;
  },
  markNotificationRead(id: string): void {
    const notifs = loadData<PlatformNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.read = true;
      saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },
  markAllNotificationsRead(): void {
    const notifs = loadData<PlatformNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    notifs.forEach((n) => (n.read = true));
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  // Audit Logs
  getAuditLogs(): AuditLogItem[] {
    return loadData<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  },
  addAuditLog(actorName: string, actorRole: string, action: string, target: string, severity: "info" | "warning" | "critical" = "info"): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      actorName,
      actorRole,
      action,
      target,
      ipAddress: "128.32.14.99 (UC Berkeley Campus Hub)",
      severity,
    };
    logs.unshift(newLog);
    saveData(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // High-level Stats
  getAdminStats() {
    const users = this.getUsers();
    const vehicles = this.getVehicles();
    const bookings = this.getBookings();
    const verifs = this.getVerifications();
    const reports = this.getReports();

    return {
      totalUsers: users.length,
      totalOwners: users.filter((u) => u.role === "owner").length,
      totalRenters: users.filter((u) => u.role === "renter").length,
      totalVehicles: vehicles.length,
      totalBookings: bookings.length,
      recentBookings: bookings.length,
      activeRides: bookings.filter((b) => b.status === "active").length,
      returnedBookings: bookings.filter((b) => b.status === "returned" || b.status === "completed").length,
      cancelledBookings: bookings.filter((b) => b.status === "cancelled").length,
      rejectedBookings: bookings.filter((b) => b.status === "rejected").length,
      pendingBookingRequests: bookings.filter((b) => b.status === "pending").length,
      pendingStudentVerifications: verifs.filter((v) => v.status === "pending" && v.type === "student_id").length,
      pendingVehicleVerifications: verifs.filter((v) => v.status === "pending" && v.type === "vehicle_rc").length,
      pendingVerifications: verifs.filter((v) => v.status === "pending").length,
      openReports: reports.filter((r) => r.status === "open").length,
    };
  },

  getPlatformStats() {
    const users = this.getUsers();
    const vehicles = this.getVehicles();
    const bookings = this.getBookings();
    const verifs = this.getVerifications();
    const reports = this.getReports();

    return {
      totalUsers: users.length,
      verifiedRenters: users.filter((u) => u.role === "renter" && u.studentVerified).length,
      verifiedHosts: users.filter((u) => u.role === "owner" && u.studentVerified).length,
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter((v) => v.status === "approved" && v.isAvailable).length,
      pendingVehicleApproval: vehicles.filter((v) => v.status === "pending_approval").length,
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b) => b.status === "active").length,
      overdueBookings: bookings.filter((b) => b.status === "overdue").length,
      pendingVerifications: verifs.filter((v) => v.status === "pending").length,
      openIncidents: reports.filter((r) => r.status === "open").length,
    };
  },

  getOwnerStats(ownerId: string) {
    const vehicles = this.getOwnerVehicles(ownerId);
    const bookings = this.getOwnerBookings(ownerId);

    return {
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((v) => v.status === "approved" && v.isAvailable).length,
      pendingApproval: vehicles.filter((v) => v.status === "pending_approval").length,
      bookingRequests: bookings.filter((b) => b.status === "pending").length,
      activeRentals: bookings.filter((b) => b.status === "active").length,
      completedReturnedRentals: bookings.filter((b) => b.status === "completed" || b.status === "returned").length,
      totalEarnings: bookings
        .filter((b) => b.status === "completed" || b.status === "returned")
        .reduce((sum, b) => sum + (b.totalCost - b.platformFee! || b.totalCost * 0.85), 0),
    };
  },

  getRenterStats(renterId: string) {
    const bookings = this.getRenterBookings(renterId);

    return {
      upcomingBookings: bookings.filter((b) => b.status === "approved").length,
      activeRentals: bookings.filter((b) => b.status === "active").length,
      pendingRequests: bookings.filter((b) => b.status === "pending").length,
      returnedRentals: bookings.filter((b) => b.status === "returned" || b.status === "completed").length,
    };
  },

  getUserFullProfile(userId: string) {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const vehicles = this.getVehicles().filter((v) => v.ownerId === userId);
    const bookings = this.getBookings().filter(
      (b) => b.renterId === userId || b.ownerId === userId
    );
    const verifications = this.getVerifications().filter(
      (v) => v.userId === userId
    );

    return {
      user,
      vehicles,
      bookings,
      verifications,
    };
  },

  updateUserKyc(
    userId: string,
    updates: Partial<User>
  ): User | undefined {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return undefined;

    users[idx] = {
      ...users[idx],
      ...updates,
    };
    saveData(STORAGE_KEYS.USERS, users);

    this.addAuditLog(
      "Admin",
      "system_admin",
      `USER_KYC_UPDATED: ${users[idx].name} KYC verification status updated`,
      userId
    );
    return users[idx];
  },
};
