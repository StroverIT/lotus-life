export interface Membership {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const memberships: Membership[] = [
  {
    id: "essence",
    name: "Lotus Essence",
    price: "€50",
    period: "per month",
    features: [
      "Up to 6 yoga classes per month",
      "Access to both halls",
      "Free mat & props rental",
      "10% off single massage sessions",
      "Online class recordings",
    ],
  },
  {
    id: "bloom",
    name: "Lotus Bloom",
    price: "€75",
    period: "per month",
    features: [
      "Unlimited yoga classes",
      "Access to both halls",
      "Free mat & props rental",
      "15% off all massage sessions",
      "15% off special events",
      "Priority booking for workshops",
      "Guest pass (1 per month)",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "life",
    name: "Lotus Life",
    price: "€120",
    period: "per month",
    features: [
      "Unlimited yoga classes",
      "1 massage session included monthly",
      "Access to all events & workshops",
      "20% off additional massages",
      "Priority booking for everything",
      "Welcome gift bundle",
      "Bring a friend free (2x per month)",
      "Personal wellness consultation",
    ],
  },
];

export const singleClassPrice = "€10";
