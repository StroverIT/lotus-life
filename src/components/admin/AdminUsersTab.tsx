"use client";

import { format, parse } from "date-fns";
import { ChevronLeft, ChevronRight, Eye, Mail, Phone, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UserDetailDialog from "@/components/admin/UserDetailDialog";
import type { AdminUser } from "@/components/admin/types";
import type { AdminVisit } from "@/components/admin/types";
import type { Membership } from "@/types/catalog";

type UserStats = Record<string, { classes: number; events: number; classMin: number; eventMin: number }>;

type AdminUsersTabProps = {
  users: AdminUser[];
  displayedUsers: AdminUser[];
  visits: AdminVisit[];
  membershipPlans: Membership[];
  userStats: UserStats;
  monthlyChartData: { month: string; attendees: number }[];
  availableMonths: string[];
  currentUserMonth: string;
  userMonthIndex: number;
  showAllUsers: boolean;
  monthActiveUserIds: Set<string>;
  selectedUser: AdminUser | null;
  onMonthIndexChange: (up: boolean) => void;
  onShowAllUsersChange: (showAll: boolean) => void;
  onSelectUser: (user: AdminUser | null) => void;
};

const AdminUsersTab = ({
  users,
  displayedUsers,
  visits,
  membershipPlans,
  userStats,
  monthlyChartData,
  availableMonths,
  currentUserMonth,
  userMonthIndex,
  showAllUsers,
  monthActiveUserIds,
  selectedUser,
  onMonthIndexChange,
  onShowAllUsersChange,
  onSelectUser,
}: AdminUsersTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl">Registered Users</h3>
        <p className="text-muted-foreground text-sm font-body">{users.length} users total</p>
      </div>

      {/* Yearly attendance chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h4 className="font-display text-lg mb-4">Monthly Attendance — 2026</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="attendees" name="Unique Attendees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month selector */}
      {availableMonths.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={userMonthIndex >= availableMonths.length - 1}
            onClick={() => onMonthIndexChange(true)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h4 className="font-display text-lg min-w-[160px] text-center">
            {format(parse(currentUserMonth, "yyyy-MM", new Date()), "MMMM yyyy")}
          </h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={userMonthIndex <= 0}
            onClick={() => onMonthIndexChange(false)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Toggle: show month attendees vs all users */}
      <div className="flex items-center gap-3">
        <Badge
          variant={!showAllUsers ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => onShowAllUsersChange(false)}
        >
          Attended this month ({monthActiveUserIds.size})
        </Badge>
        <Badge
          variant={showAllUsers ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => onShowAllUsersChange(true)}
        >
          All Users ({users.length})
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Total Time</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedUsers.map((user) => {
            const plan = membershipPlans.find((m) => m.id === user.membershipId);
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-display text-base">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-sm font-body text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {user.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {plan ? (
                    <Badge variant={plan.highlighted ? "default" : "secondary"}>
                      {plan.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm font-body">Drop-in</span>
                  )}
                </TableCell>
                <TableCell className="font-body font-semibold">{userStats[user.id]?.classes ?? 0}</TableCell>
                <TableCell className="font-body font-semibold">{userStats[user.id]?.events ?? 0}</TableCell>
                <TableCell className="font-body text-muted-foreground text-sm">
                  {(() => {
                    const s = userStats[user.id];
                    if (!s) return "—";
                    const total = s.classMin + s.eventMin;
                    return `${Math.floor(total / 60)}h ${total % 60}m`;
                  })()}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onSelectUser(user)}>
                    <Eye className="w-3 h-3 mr-1" /> Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {displayedUsers.length === 0 && (
        <p className="text-muted-foreground text-sm font-body text-center py-6">No users attended this month</p>
      )}
      <UserDetailDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(o) => !o && onSelectUser(null)}
        visits={visits}
        plans={membershipPlans}
      />
    </div>
  );
};

export default AdminUsersTab;
