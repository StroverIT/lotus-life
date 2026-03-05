export interface Visit {
  id: string;
  userId: string;
  date: string; // ISO date string
  className: string;
  type: "class" | "event";
  duration: string;
  hall: "Pirin Hall" | "Rodopi Hall" | "Both Halls";
  instructor?: string;
}

// Sample visit history data with user associations
export const sampleVisits: Visit[] = [
  // March 2026
  { id: "v1", userId: "u1", date: "2026-03-03", className: "Hatha Yoga", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v2", userId: "u1", date: "2026-03-05", className: "Aerial Yoga", type: "class", duration: "60 min", hall: "Rodopi Hall", instructor: "Elena" },
  { id: "v3", userId: "u2", date: "2026-03-07", className: "Sound Journey", type: "class", duration: "90 min", hall: "Pirin Hall", instructor: "Elena" },
  { id: "v4", userId: "u3", date: "2026-03-10", className: "Qi-gong", type: "class", duration: "60 min", hall: "Rodopi Hall", instructor: "Li Wei" },
  { id: "v5", userId: "u1", date: "2026-03-12", className: "Mobility Flow", type: "class", duration: "60 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v6", userId: "u2", date: "2026-03-14", className: "Full Moon Sound Bath", type: "event", duration: "120 min", hall: "Pirin Hall" },
  { id: "v7", userId: "u5", date: "2026-03-17", className: "Hatha Yoga", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v8", userId: "u5", date: "2026-03-19", className: "Dance Meditation", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v9a", userId: "u1", date: "2026-03-14", className: "Full Moon Sound Bath", type: "event", duration: "120 min", hall: "Pirin Hall" },
  { id: "v9b", userId: "u5", date: "2026-03-14", className: "Full Moon Sound Bath", type: "event", duration: "120 min", hall: "Pirin Hall" },
  { id: "v9c", userId: "u3", date: "2026-03-14", className: "Full Moon Sound Bath", type: "event", duration: "120 min", hall: "Pirin Hall" },
  { id: "v9d", userId: "u6", date: "2026-03-14", className: "Full Moon Sound Bath", type: "event", duration: "120 min", hall: "Pirin Hall" },

  // February 2026
  { id: "v9", userId: "u1", date: "2026-02-03", className: "Hatha Yoga", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v10", userId: "u2", date: "2026-02-06", className: "Taichi", type: "class", duration: "60 min", hall: "Pirin Hall", instructor: "Li Wei" },
  { id: "v11", userId: "u3", date: "2026-02-10", className: "Aerial Yoga", type: "class", duration: "60 min", hall: "Rodopi Hall", instructor: "Elena" },
  { id: "v12", userId: "u1", date: "2026-02-14", className: "Hatha Yoga", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v13", userId: "u5", date: "2026-02-20", className: "Sound Journey", type: "class", duration: "90 min", hall: "Rodopi Hall", instructor: "Elena" },
  { id: "v14", userId: "u2", date: "2026-02-22", className: "Weekend Yoga Retreat", type: "event", duration: "2 days", hall: "Both Halls" },
  { id: "v14b", userId: "u1", date: "2026-02-22", className: "Weekend Yoga Retreat", type: "event", duration: "2 days", hall: "Both Halls" },
  { id: "v14c", userId: "u5", date: "2026-02-22", className: "Weekend Yoga Retreat", type: "event", duration: "2 days", hall: "Both Halls" },

  // January 2026
  { id: "v15", userId: "u1", date: "2026-01-06", className: "Hatha Yoga", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v16", userId: "u2", date: "2026-01-10", className: "Qi-gong", type: "class", duration: "60 min", hall: "Rodopi Hall", instructor: "Li Wei" },
  { id: "v17", userId: "u3", date: "2026-01-15", className: "Face Yoga", type: "class", duration: "45 min", hall: "Rodopi Hall", instructor: "Elena" },
  { id: "v18", userId: "u5", date: "2026-01-22", className: "Dance Meditation", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
  { id: "v19", userId: "u4", date: "2026-01-25", className: "Hatha Yoga", type: "class", duration: "75 min", hall: "Pirin Hall", instructor: "Maya" },
];
