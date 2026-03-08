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

export type AdminMassageBookingRow = {
  id: string;
  massageId: string;
  massageName: string;
  userId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  date: string;
  time: string;
  duration: number;
  status: string | null;
  createdAt: string;
};

export type AdminUserMembershipRow = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  membershipId: string;
  membershipName: string;
  membershipPrice: string;
  membershipPeriod: string;
  status: string;
  paymentMethod: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
};
