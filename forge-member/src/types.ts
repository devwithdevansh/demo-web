export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  note?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface Meal {
  label: string;
  items: string;
}

export interface MemberPortalData {
  today: string;
  weekday: string;
  gymName: string;
  member: {
    id: string;
    memberCode: string;
    name: string;
    phone: string;
    email?: string;
    category: string;
    planName: string;
    planPrice: number;
    startDate: string;
    expiryDate: string;
    status: 'active' | 'expiring' | 'expired';
    daysLeft: number;
    feeDue: number;
    trainerName: string | null;
    trainerTitle: string | null;
    pt: { total: number; used: number };
    workout?: {
      title: string;
      updatedAt?: string;
      updatedBy?: string;
      days: WorkoutDay[];
    };
    diet?: {
      title: string;
      note?: string;
      updatedAt?: string;
      updatedBy?: string;
      meals: Meal[];
    };
  };
  visits: string[];
  announcements: {
    id: string;
    title: string;
    body?: string;
    createdAt: string;
  }[];
  slots: {
    id: string;
    day: string;
    time: string;
    name: string;
    durationMin: number;
    trainerName?: string;
  }[];
  addons: {
    autopay: boolean;
  };
}

export interface Session {
  token: string;
  user: { id: string; name: string; role: 'member'; title?: string };
  gym: { name: string; package: string; addons?: Record<string, boolean> };
}
