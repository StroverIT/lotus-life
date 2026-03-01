"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/memberships", label: "Memberships" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 p-1 rounded-lg bg-cream border border-border">
      {tabs.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === href
              ? "bg-sage text-white"
              : "text-charcoal-light hover:text-charcoal hover:bg-warm-white"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
