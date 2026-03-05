import { type LucideIcon } from "lucide-react";
import { Hand, Layers, Droplets, Flame, Move, Sparkles } from "lucide-react";

export interface MassageType {
  id: string;
  name: string;
  icon: LucideIcon;
  price30: string;
  price60: string;
  description: string;
  benefits: string[];
  availableDays: string[];
}

export const MASSAGE_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

export const massageTypes: MassageType[] = [
  {
    id: "classic",
    name: "Classic Relaxation Massage",
    icon: Hand,
    price30: "€30",
    price60: "€45",
    description: "A soothing full-body massage using long, flowing strokes to melt away tension and restore balance. Perfect for those seeking deep relaxation.",
    benefits: ["Stress relief", "Improved circulation", "Muscle tension release", "Better sleep"],
    availableDays: ["Monday", "Thursday", "Friday"],
  },
  {
    id: "deep-tissue",
    name: "Deep Tissue Massage",
    icon: Layers,
    price30: "€35",
    price60: "€55",
    description: "Targeted deep pressure work focusing on chronic muscle tension and knots. Ideal for athletes and those with persistent pain.",
    benefits: ["Chronic pain relief", "Improved mobility", "Injury recovery", "Postural correction"],
    availableDays: ["Monday", "Thursday", "Friday"],
  },
  {
    id: "aromatherapy",
    name: "Aromatherapy Massage",
    icon: Droplets,
    price30: "€35",
    price60: "€55",
    description: "A holistic massage combining gentle techniques with therapeutic essential oils chosen for your specific needs.",
    benefits: ["Emotional balance", "Enhanced relaxation", "Skin nourishment", "Mood elevation"],
    availableDays: ["Monday", "Thursday", "Friday"],
  },
  {
    id: "hot-stone",
    name: "Hot Stone Therapy",
    icon: Flame,
    price30: "€40",
    price60: "€65",
    description: "Warm volcanic stones placed along energy meridians, combined with massage to create profound relaxation and energy flow.",
    benefits: ["Deep muscle relaxation", "Energy balancing", "Improved circulation", "Pain management"],
    availableDays: ["Monday", "Thursday", "Friday"],
  },
  {
    id: "thai",
    name: "Traditional Thai Massage",
    icon: Move,
    price30: "€35",
    price60: "€60",
    description: "An ancient healing art combining assisted yoga stretches, acupressure, and energy line work. Performed on a floor mat, fully clothed.",
    benefits: ["Increased flexibility", "Energy flow", "Joint mobility", "Full body stretch"],
    availableDays: ["Monday", "Thursday", "Friday"],
  },
  {
    id: "face-body",
    name: "Face & Body Ritual",
    icon: Sparkles,
    price30: "€50",
    price60: "€85",
    description: "Our signature treatment combining a full-body massage with a rejuvenating facial massage using natural mountain botanicals.",
    benefits: ["Complete renewal", "Facial glow", "Deep relaxation", "Anti-aging benefits"],
    availableDays: ["Monday", "Thursday", "Friday"],
  },
];
