"use client";

import { Sun, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

type Season = "summer" | "winter";

type AdminThemeTabProps = {
  season: Season;
  onSeasonChange: (season: Season) => void;
};

const AdminThemeTab = ({ season, onSeasonChange }: AdminThemeTabProps) => {
  return (
    <div className="space-y-8">
      <h3 className="font-display text-2xl">Seasonal Theme</h3>
      <p className="text-muted-foreground font-body">
        Switch between summer and winter color palettes. The change applies across the entire site.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
        <button
          onClick={() => onSeasonChange("summer")}
          className={cn(
            "rounded-xl border-2 p-8 text-center transition-all",
            season === "summer" ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/30"
          )}
        >
          <Sun className="w-10 h-10 mx-auto mb-3 text-amber-500" />
          <p className="font-display text-xl mb-1">Summer</p>
          <p className="text-muted-foreground text-sm font-body">Warm purples with golden accents</p>
        </button>
        <button
          onClick={() => onSeasonChange("winter")}
          className={cn(
            "rounded-xl border-2 p-8 text-center transition-all",
            season === "winter" ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/30"
          )}
        >
          <Snowflake className="w-10 h-10 mx-auto mb-3 text-sky-400" />
          <p className="font-display text-xl mb-1">Winter</p>
          <p className="text-muted-foreground text-sm font-body">Cool purples with icy blue accents</p>
        </button>
      </div>
      <div className="rounded-xl bg-secondary p-6 max-w-lg">
        <p className="text-sm font-body text-muted-foreground">
          Current theme: <span className="font-semibold text-foreground capitalize">{season}</span>
        </p>
      </div>
    </div>
  );
};

export default AdminThemeTab;
