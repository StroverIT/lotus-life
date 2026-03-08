export type AdminUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  membershipId: string | null;
  joinedAt: string | null;
  membership?: { id: string; name: string; highlighted: boolean } | null;
};

export type AdminVisit = {
  id: string;
  userId: string | null;
  date: string;
  className: string;
  type: "CLASS" | "EVENT";
  duration: string;
  hall: string;
  instructor?: string | null;
};
