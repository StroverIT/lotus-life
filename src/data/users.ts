export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipId: string | null;
  joinedAt: string;
  totalVisits: number;
  lastVisit: string | null;
}

export const sampleUsers: UserRecord[] = [
  {
    id: "u1",
    name: "Maya Petrova",
    email: "maya@example.com",
    phone: "+359 88 123 4567",
    membershipId: "bloom",
    joinedAt: "2025-09-15",
    totalVisits: 47,
    lastVisit: "2026-03-03",
  },
  {
    id: "u2",
    name: "Stefan Ivanov",
    email: "stefan@example.com",
    phone: "+359 89 765 4321",
    membershipId: "life",
    joinedAt: "2025-11-02",
    totalVisits: 32,
    lastVisit: "2026-03-01",
  },
  {
    id: "u3",
    name: "Elena Dimitrova",
    email: "elena.d@example.com",
    phone: "+359 87 555 1234",
    membershipId: "essence",
    joinedAt: "2026-01-10",
    totalVisits: 12,
    lastVisit: "2026-02-28",
  },
  {
    id: "u4",
    name: "Nikolay Georgiev",
    email: "nik.geo@example.com",
    phone: "+359 88 999 8877",
    membershipId: null,
    joinedAt: "2026-02-20",
    totalVisits: 3,
    lastVisit: "2026-02-25",
  },
  {
    id: "u5",
    name: "Anna Todorova",
    email: "anna.t@example.com",
    phone: "+359 89 333 2211",
    membershipId: "bloom",
    joinedAt: "2025-10-05",
    totalVisits: 38,
    lastVisit: "2026-03-02",
  },
  {
    id: "u6",
    name: "Viktor Kolev",
    email: "v.kolev@example.com",
    phone: "+359 87 111 4455",
    membershipId: null,
    joinedAt: "2026-03-01",
    totalVisits: 1,
    lastVisit: "2026-03-01",
  },
];
