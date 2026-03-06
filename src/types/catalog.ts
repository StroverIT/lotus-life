export interface YogaClass {
  id: string;
  name: string;
  time: string;
  duration: string;
  hall: string;
  instructor: string;
  description: string;
}

export interface DaySchedule {
  day: string;
  classes: YogaClass[];
}

export interface YogaEvent {
  id: string;
  name: string;
  dateLabel: string;
  time: string;
  duration: string;
  hall: string;
  price: string;
  description: string;
}

export interface Massage {
  id: string;
  name: string;
  iconKey: string;
  price30: string;
  price60: string;
  description: string;
  benefits: string[];
  availableDays: string[];
}

export interface Membership {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string | null;
}

