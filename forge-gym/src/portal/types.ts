// Shapes returned by the API, as used by the portal screens.

export type MemberStatus = 'active' | 'expiring' | 'expired';
export type AutopayStatus = 'none' | 'requested' | 'active' | 'paused' | 'cancelled';

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  active: boolean;
}

export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  note?: string;
  videoUrl?: string;
}
export interface WorkoutDay {
  day: string;
  focus?: string;
  exercises: Exercise[];
}
export interface Workout {
  title?: string;
  updatedAt?: string;
  updatedBy?: string;
  days: WorkoutDay[];
}
export interface Diet {
  title?: string;
  note?: string;
  updatedAt?: string;
  updatedBy?: string;
  meals: { label: string; items: string }[];
}

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  planId: string;
  planName: string;
  planPrice: number;
  startDate: string;
  expiryDate: string;
  feeDue: number;
  trainerId: string | null;
  trainerName: string | null;
  notes?: string;
  pt: { total: number; used: number };
  autopay?: { status: AutopayStatus; amount?: number; updatedAt?: string };
  status: MemberStatus;
  daysLeft: number;
  workout?: Workout;
  diet?: Diet;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName?: string;
  amount: number;
  method: string;
  paidOn: string;
  note?: string;
  recordedBy?: string;
  simulated: boolean;
  /** 'razorpay_test' when a payment provider confirmed it in test mode. */
  gateway?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  interest?: string;
  source: string;
  status: string;
  followUpOn?: string;
  notes?: string;
  createdAt: string;
}

export interface CoachLog {
  id: string;
  day: string;
  type: 'checkin' | 'measurement' | 'pt_session';
  trainerName?: string;
  weightKg?: number;
  waistCm?: number;
  note?: string;
}

export interface ClassSlot {
  id: string;
  day: string;
  time: string;
  name: string;
  durationMin: number;
  trainerId: string | null;
  trainerName: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body?: string;
  postedBy?: string;
  createdAt: string;
}

export interface ActionLog {
  id: string;
  kind: 'whatsapp' | 'upi_link' | 'autopay';
  title: string;
  detail?: string;
  status: string;
  reason?: string;
  gateway?: string;
  amount?: number;
  createdAt: string;
}

export const PAY_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer' },
];
export const methodLabel = (value: string) => PAY_METHODS.find((m) => m.value === value)?.label ?? value;

export const CATEGORIES = ['General fitness', 'Weight loss', 'Strength', 'Beginner', 'Senior', 'Student', 'Personal training'];
