import { useState, useMemo } from "react";
import { format, parse } from "date-fns";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Sparkles, Dumbbell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type UserRecord } from "@/data/users";
import { type Visit, sampleVisits } from "@/data/visits";
import { memberships } from "@/data/memberships";

interface UserDetailDialogProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*min/);
  if (match) return parseInt(match[1], 10);
  const dayMatch = duration.match(/(\d+)\s*day/);
  if (dayMatch) return parseInt(dayMatch[1], 10) * 480; // 8h per day
  return 0;
}

function getAvailableMonths(visits: Visit[]): string[] {
  const months = new Set<string>();
  visits.forEach((v) => months.add(v.date.slice(0, 7)));
  return Array.from(months).sort().reverse();
}

function formatMonthLabel(key: string): string {
  const d = parse(key, "yyyy-MM", new Date());
  return format(d, "MMMM yyyy");
}

const UserDetailDialog = ({ user, open, onOpenChange }: UserDetailDialogProps) => {
  const [monthIndex, setMonthIndex] = useState(0);

  const userVisits = useMemo(
    () => (user ? sampleVisits.filter((v) => v.userId === user.id) : []),
    [user]
  );

  const availableMonths = useMemo(() => getAvailableMonths(userVisits), [userVisits]);

  const currentMonthKey = availableMonths[monthIndex] || "";
  const monthVisits = useMemo(
    () => userVisits.filter((v) => v.date.startsWith(currentMonthKey)),
    [userVisits, currentMonthKey]
  );

  const classVisits = monthVisits.filter((v) => v.type === "class");
  const eventVisits = monthVisits.filter((v) => v.type === "event");
  const totalClassMinutes = classVisits.reduce((sum, v) => sum + parseDuration(v.duration), 0);
  const totalEventMinutes = eventVisits.reduce((sum, v) => sum + parseDuration(v.duration), 0);

  // Totals across all time
  const allClassVisits = userVisits.filter((v) => v.type === "class");
  const allEventVisits = userVisits.filter((v) => v.type === "event");
  const totalAllClassMin = allClassVisits.reduce((sum, v) => sum + parseDuration(v.duration), 0);
  const totalAllEventMin = allEventVisits.reduce((sum, v) => sum + parseDuration(v.duration), 0);

  const plan = user ? memberships.find((m) => m.id === user.membershipId) : null;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            {user.name}
          </DialogTitle>
        </DialogHeader>

        {/* User info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-body">
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Phone</p>
            <p>{user.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Membership</p>
            {plan ? <Badge variant={plan.highlighted ? "default" : "secondary"}>{plan.name}</Badge> : <span className="text-muted-foreground">Drop-in</span>}
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Joined</p>
            <p>{user.joinedAt}</p>
          </div>
        </div>

        {/* All-time totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="font-display text-xl">{allClassVisits.length}</p>
            <p className="text-xs text-muted-foreground font-body">Total Classes</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="font-display text-xl">{Math.round(totalAllClassMin / 60)}h {totalAllClassMin % 60}m</p>
            <p className="text-xs text-muted-foreground font-body">Class Time</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="font-display text-xl">{allEventVisits.length}</p>
            <p className="text-xs text-muted-foreground font-body">Total Events</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="font-display text-xl">{Math.round(totalAllEventMin / 60)}h {totalAllEventMin % 60}m</p>
            <p className="text-xs text-muted-foreground font-body">Event Time</p>
          </div>
        </div>

        {/* Month selector */}
        {availableMonths.length > 0 && (
          <div className="flex items-center justify-between mt-4 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={monthIndex >= availableMonths.length - 1}
              onClick={() => setMonthIndex((i) => i + 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h4 className="font-display text-lg">{formatMonthLabel(currentMonthKey)}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={monthIndex <= 0}
              onClick={() => setMonthIndex((i) => i - 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Monthly summary */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-secondary/50 p-3 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-primary" />
            <div>
              <span className="font-semibold">{classVisits.length}</span> classes
              <span className="text-muted-foreground ml-1">({totalClassMinutes} min)</span>
            </div>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <div>
              <span className="font-semibold">{eventVisits.length}</span> events
              <span className="text-muted-foreground ml-1">({totalEventMinutes} min)</span>
            </div>
          </div>
        </div>

        {/* Visit list for selected month */}
        {monthVisits.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body text-center py-6">No visits this month</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Class / Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Hall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-body text-sm">{format(new Date(visit.date), "MMM d")}</TableCell>
                  <TableCell className="font-display">{visit.className}</TableCell>
                  <TableCell>
                    <Badge variant={visit.type === "event" ? "default" : "secondary"} className="text-xs">
                      {visit.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-body text-muted-foreground">{visit.duration}</TableCell>
                  <TableCell className="font-body text-muted-foreground text-sm">{visit.hall}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog;
