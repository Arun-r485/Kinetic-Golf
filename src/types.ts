export type UserRole = "public" | "subscriber" | "admin";

export interface User {
  uid: string;
  id: string; 
  displayName: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionStatus: "active" | "inactive" | "lapsed" | "cancelled";
  subscriptionPlan?: string | null;
  subscriptionRenewalDate?: string | null;
  charityId?: string | any;
  charityContributionPercent?: number;
  isSubscribed?: boolean;
  subscriptionTier?: "amateur" | "pro" | "legend";
  phone?: string;
  address?: string;
  state?: string;
  pincode?: string;
  plan?: {
    name: string;
    price: number;
    desc: string;
    features: string[];
    cta: string;
    featured: boolean;
    cycle: "monthly" | "yearly";
  };
  billingCycle?: "monthly" | "yearly";
  avatar?: string;
  region?: string;
  currency?: string;
  createdAt?: string;
}

export interface Score {
  id: string;
  userId: string;
  score: number;
  points: number;
  date: string;
  course: string;
  holeScores?: number[];
  holePars?: number[];
  isLatest?: boolean;
  isOldest?: boolean;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image: string;
  totalDonations: number;
  impactMetric: string;
  totalRaised?: number; // Keep if still used by some components
}

export interface Draw {
  id: string;
  number: string;
  date?: string;
  drawnNumbers: number[];
  type: string;
  status: "upcoming" | "simulating" | "published";
  isPublished: boolean;
  prizePool: number;
  jackpotAmount?: number;
  totalParticipants?: number;
  createdAt: string;
}

export interface WinnerProof {
  id: string;
  userId: string;
  drawId: string;
  matchType: number;
  prizeAmount: number;
  proofUrl: string;
  verificationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Winnings {
  id: string;
  userId: string;
  amount: number;
  matchType: number;
  status: "pending" | "approved" | "paid";
  date: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  withdrawalMethod: "bank" | "upi";
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  upiId?: string;
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
}
export interface AdminReport {
  users: {
    total: number
    active: number
  }
  draws: {
    total: number
  }
  winners: {
    pending: number
  }
  financials: {
    prizePoolEstimate: string
    jackpotAmount: string
    totalWithdrawnPaid: number
    totalWithdrawnPending: number
  }
  charityDistribution: Record<string, number>
  nextDrawDate: string
}

export interface AdminScoreEntry {
  id: string
  userId: string
  score: number
  datePlayed: string
  createdAt: string
  users: {
    name: string
    email: string
  }
}

export interface AuditEvent {
  id: string
  type: 'registration' | 'subscription' | 'withdrawal' | 'draw'
  createdAt: string
  [key: string]: any
}
