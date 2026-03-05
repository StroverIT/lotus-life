export interface YogaClass {
  id: string;
  name: string;
  time: string;
  duration: string;
  hall: "Pirin Hall" | "Rodopi Hall";
  instructor: string;
  description: string;
}

export interface DaySchedule {
  day: string;
  classes: YogaClass[];
}

export const weeklySchedule: DaySchedule[] = [
  {
    day: "Monday",
    classes: [
      { id: "mon-1", name: "Hatha Yoga", time: "08:00", duration: "75 min", hall: "Pirin Hall", instructor: "Maya", description: "Traditional hatha practice focusing on alignment, breath, and mindful movement." },
      { id: "mon-2", name: "Aerial Yoga", time: "10:30", duration: "60 min", hall: "Rodopi Hall", instructor: "Elena", description: "Explore gravity-defying poses using silk hammocks for deeper stretches and playful inversions." },
      { id: "mon-3", name: "Mobility Flow", time: "17:00", duration: "60 min", hall: "Pirin Hall", instructor: "Maya", description: "Improve joint mobility and functional movement through dynamic flowing sequences." },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      { id: "tue-1", name: "Qi-gong", time: "08:00", duration: "60 min", hall: "Rodopi Hall", instructor: "Li Wei", description: "Ancient Chinese practice combining slow movement, breath work, and meditation for energy cultivation." },
      { id: "tue-2", name: "Hatha Yoga", time: "10:00", duration: "75 min", hall: "Pirin Hall", instructor: "Maya", description: "Traditional hatha practice focusing on alignment, breath, and mindful movement." },
      { id: "tue-3", name: "Face Yoga", time: "18:00", duration: "45 min", hall: "Rodopi Hall", instructor: "Elena", description: "Natural face-lifting techniques through targeted facial exercises and massage." },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      { id: "wed-1", name: "Taichi", time: "08:00", duration: "60 min", hall: "Pirin Hall", instructor: "Li Wei", description: "Moving meditation through slow, deliberate martial arts forms that cultivate inner peace." },
      { id: "wed-2", name: "Aerial Yoga", time: "10:30", duration: "60 min", hall: "Rodopi Hall", instructor: "Elena", description: "Explore gravity-defying poses using silk hammocks for deeper stretches and playful inversions." },
      { id: "wed-3", name: "Dance Meditation", time: "18:00", duration: "75 min", hall: "Pirin Hall", instructor: "Maya", description: "Free-form movement meditation combining ecstatic dance with guided mindfulness." },
    ],
  },
  {
    day: "Thursday",
    classes: [
      { id: "thu-1", name: "Hatha Yoga", time: "08:00", duration: "75 min", hall: "Pirin Hall", instructor: "Maya", description: "Traditional hatha practice focusing on alignment, breath, and mindful movement." },
      { id: "thu-2", name: "Qi-gong", time: "10:00", duration: "60 min", hall: "Rodopi Hall", instructor: "Li Wei", description: "Ancient Chinese practice combining slow movement, breath work, and meditation for energy cultivation." },
      { id: "thu-3", name: "Mobility Flow", time: "17:00", duration: "60 min", hall: "Pirin Hall", instructor: "Maya", description: "Improve joint mobility and functional movement through dynamic flowing sequences." },
    ],
  },
  {
    day: "Friday",
    classes: [
      { id: "fri-1", name: "Taichi", time: "08:00", duration: "60 min", hall: "Pirin Hall", instructor: "Li Wei", description: "Moving meditation through slow, deliberate martial arts forms that cultivate inner peace." },
      { id: "fri-2", name: "Hatha Yoga", time: "10:00", duration: "75 min", hall: "Rodopi Hall", instructor: "Maya", description: "Traditional hatha practice focusing on alignment, breath, and mindful movement." },
      { id: "fri-3", name: "Sound Journey", time: "19:00", duration: "90 min", hall: "Pirin Hall", instructor: "Elena", description: "Deep relaxation through immersive sound healing with singing bowls, gongs, and chimes." },
    ],
  },
  {
    day: "Saturday",
    classes: [
      { id: "sat-1", name: "Hatha Yoga", time: "09:00", duration: "75 min", hall: "Pirin Hall", instructor: "Maya", description: "Traditional hatha practice focusing on alignment, breath, and mindful movement." },
      { id: "sat-2", name: "Aerial Yoga", time: "11:00", duration: "60 min", hall: "Rodopi Hall", instructor: "Elena", description: "Explore gravity-defying poses using silk hammocks for deeper stretches and playful inversions." },
    ],
  },
  {
    day: "Sunday",
    classes: [
      { id: "sun-1", name: "Dance Meditation", time: "10:00", duration: "75 min", hall: "Pirin Hall", instructor: "Maya", description: "Free-form movement meditation combining ecstatic dance with guided mindfulness." },
      { id: "sun-2", name: "Sound Journey", time: "18:00", duration: "90 min", hall: "Rodopi Hall", instructor: "Elena", description: "Deep relaxation through immersive sound healing with singing bowls, gongs, and chimes." },
    ],
  },
];

export const yogaEvents = [
  {
    id: "evt-1",
    name: "Full Moon Sound Bath",
    date: "March 14, 2026",
    time: "20:00",
    duration: "2 hours",
    hall: "Pirin Hall",
    price: "€20",
    description: "A deeply immersive sound healing experience under the full moon energy. Limited to 15 participants.",
  },
  {
    id: "evt-2",
    name: "Weekend Yoga Retreat",
    date: "March 21-22, 2026",
    time: "09:00 - 17:00",
    duration: "2 days",
    hall: "Both Halls",
    price: "€80",
    description: "A transformative weekend of yoga, meditation, and mountain walks in the heart of Bansko.",
  },
];
