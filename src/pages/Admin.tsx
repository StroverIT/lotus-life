"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventAttendeesDialog from "@/components/admin/EventAttendeesDialog";
import EditMassageDialog from "@/components/admin/EditMassageDialog";
import CreateMassageDialog from "@/components/admin/CreateMassageDialog";
import AddClassDialog from "@/components/admin/AddClassDialog";
import CreateEventDialog from "@/components/admin/CreateEventDialog";
import CreateMembershipDialog from "@/components/admin/CreateMembershipDialog";
import AdminScheduleTab from "@/components/admin/AdminScheduleTab";
import AdminEventsTab from "@/components/admin/AdminEventsTab";
import AdminMassagesTab from "@/components/admin/AdminMassagesTab";
import AdminMembershipsTab from "@/components/admin/AdminMembershipsTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminThemeTab from "@/components/admin/AdminThemeTab";
import { useTheme } from "@/context/ThemeContext";
import type { DaySchedule, Membership, Massage, YogaClass, YogaEvent } from "@/types/catalog";
import type { AdminUser, AdminVisit, AdminMassageBookingRow } from "@/components/admin/types";

const ADMIN_STALE_MS = 2 * 60 * 1000; // 2 minutes

const adminQueryKeys = {
  schedule: ["admin", "schedule"] as const,
  events: ["admin", "events"] as const,
  massages: ["admin", "massages"] as const,
  massageBookings: ["admin", "massage-bookings"] as const,
  memberships: ["admin", "memberships"] as const,
  users: ["admin", "users"] as const,
  visits: ["admin", "visits"] as const,
};

const AdminPage = () => {
  const { season, setSeason } = useTheme();
  const queryClient = useQueryClient();

  const { data: schedule = [], isPending: scheduleLoading } = useQuery({
    queryKey: adminQueryKeys.schedule,
    queryFn: async () => {
      const res = await fetch("/api/schedule");
      const json = await res.json();
      return json as DaySchedule[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const { data: events = [] } = useQuery({
    queryKey: adminQueryKeys.events,
    queryFn: async () => {
      const res = await fetch("/api/events");
      const json = await res.json();
      return json as YogaEvent[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const { data: massages = [] } = useQuery({
    queryKey: adminQueryKeys.massages,
    queryFn: async () => {
      const res = await fetch("/api/massages");
      const json = await res.json();
      return json as Massage[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const { data: massageBookings = [] } = useQuery({
    queryKey: adminQueryKeys.massageBookings,
    queryFn: async () => {
      const res = await fetch("/api/admin/massage-bookings");
      const json = await res.json();
      return json as AdminMassageBookingRow[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const { data: membershipPlans = [] } = useQuery({
    queryKey: adminQueryKeys.memberships,
    queryFn: async () => {
      const res = await fetch("/api/memberships");
      const json = await res.json();
      return json as Membership[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const { data: users = [] } = useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      return json as AdminUser[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const { data: visits = [] } = useQuery({
    queryKey: adminQueryKeys.visits,
    queryFn: async () => {
      const res = await fetch("/api/admin/visits");
      const json = await res.json();
      return json as AdminVisit[];
    },
    staleTime: ADMIN_STALE_MS,
  });

  const [selectedEventName, setSelectedEventName] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // CRUD modal states
  const [editingMassage, setEditingMassage] = useState<Massage | null>(null);
  const [showCreateMassage, setShowCreateMassage] = useState(false);
  const [addClassDayIndex, setAddClassDayIndex] = useState<number | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateMembership, setShowCreateMembership] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Month selector state for users tab
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    visits.forEach((v) => months.add(v.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [visits]);
  const [userMonthIndex, setUserMonthIndex] = useState(0);
  const currentUserMonth = availableMonths[userMonthIndex] || "";

  // Compute attendance stats per user filtered by selected month
  const userStats = useMemo(() => {
    const stats: Record<string, { classes: number; events: number; classMin: number; eventMin: number }> = {};
    visits
      .filter((v) => v.date.startsWith(currentUserMonth))
      .forEach((v) => {
        if (!v.userId) return;
        if (!stats[v.userId]) stats[v.userId] = { classes: 0, events: 0, classMin: 0, eventMin: 0 };
        const min = parseInt(v.duration.match(/(\d+)/)?.[1] || "0", 10) * (v.duration.includes("day") ? 480 : 1);
        if (v.type === "CLASS") {
          stats[v.userId].classes++;
          stats[v.userId].classMin += min;
        } else {
          stats[v.userId].events++;
          stats[v.userId].eventMin += min;
        }
      });
    return stats;
  }, [currentUserMonth, visits]);

  // Event attendee counts
  const eventAttendeeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    visits
      .filter((v) => v.type === "EVENT")
      .forEach((v) => {
        counts[v.className] = (counts[v.className] || 0) + 1;
      });
    return counts;
  }, [visits]);

  // Yearly chart data: unique attendees per month
  const monthlyChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.map((month, i) => {
      const key = `2026-${String(i + 1).padStart(2, "0")}`;
      const uniqueUsers = new Set(visits.filter((v) => v.date.startsWith(key)).map((v) => v.userId).filter(Boolean));
      return { month, attendees: uniqueUsers.size };
    });
  }, [visits]);

  // Users who attended in the selected month
  const monthActiveUserIds = useMemo(() => {
    return new Set(visits.filter((v) => v.date.startsWith(currentUserMonth)).map((v) => v.userId).filter(Boolean));
  }, [currentUserMonth, visits]);

  const displayedUsers = useMemo(() => {
    if (showAllUsers) return users;
    return users.filter((u) => monthActiveUserIds.has(u.id));
  }, [showAllUsers, users, monthActiveUserIds]);

  const deleteClass = async (dayIndex: number, classId: string) => {
    try {
      await fetch(`/api/schedule/classes/${classId}`, { method: "DELETE" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.schedule });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.events });
    }
  };

  const deleteMassage = async (id: string) => {
    try {
      await fetch(`/api/massages/${id}`, { method: "DELETE" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.massages });
    }
  };

  const deleteMembership = async (id: string) => {
    try {
      await fetch(`/api/memberships/${id}`, { method: "DELETE" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.memberships });
    }
  };

  const handleSaveMassage = async (updated: Massage) => {
    try {
      await fetch(`/api/massages/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.massages });
    }
  };

  const handleCreateMassage = async (massage: Massage) => {
    try {
      await fetch(`/api/massages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(massage),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.massages });
    }
  };

  const updateMassageBookingStatus = async (bookingId: string, status: "shown" | "didnt_show" | null) => {
    try {
      await fetch(`/api/admin/massage-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.massageBookings });
    }
  };

  const handleAddClass = async (dayIndex: number, cls: YogaClass) => {
    const day = schedule[dayIndex]?.day;
    if (!day) return;
    try {
      await fetch(`/api/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, cls }),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.schedule });
    }
  };

  const handleCreateEvent = async (event: YogaEvent) => {
    try {
      await fetch(`/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.events });
    }
  };

  const handleCreateMembership = async (plan: Membership) => {
    try {
      await fetch(`/api/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.memberships });
    }
  };

  return (
    <Layout>
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-4xl md:text-5xl">Admin Panel</h1>
              <p className="text-muted-foreground font-body mt-2">Manage your wellness offerings and theme</p>
            </div>
          </div>

          <Tabs defaultValue="schedule" className="space-y-8">
            <TabsList className="grid w-full grid-cols-6 max-w-3xl">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="massages">Massages</TabsTrigger>
              <TabsTrigger value="memberships">Memberships</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-8">
              <AdminScheduleTab
                schedule={schedule}
                isLoading={scheduleLoading}
                onAddClass={setAddClassDayIndex}
                onDeleteClass={deleteClass}
              />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <AdminEventsTab
                events={events}
                eventAttendeeCounts={eventAttendeeCounts}
                onAddEvent={() => setShowCreateEvent(true)}
                onViewAttendees={setSelectedEventName}
                onDeleteEvent={deleteEvent}
              />
            </TabsContent>

            <TabsContent value="massages" className="space-y-6">
              <AdminMassagesTab
                massages={massages}
                massageBookings={massageBookings}
                onAddTreatment={() => setShowCreateMassage(true)}
                onEdit={setEditingMassage}
                onDelete={deleteMassage}
                onUpdateBookingStatus={updateMassageBookingStatus}
              />
            </TabsContent>

            <TabsContent value="memberships" className="space-y-6">
              <AdminMembershipsTab
                membershipPlans={membershipPlans}
                onAddPlan={() => setShowCreateMembership(true)}
                onDelete={deleteMembership}
              />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <AdminUsersTab
                users={users}
                displayedUsers={displayedUsers}
                visits={visits}
                membershipPlans={membershipPlans}
                userStats={userStats}
                monthlyChartData={monthlyChartData}
                availableMonths={availableMonths}
                currentUserMonth={currentUserMonth}
                userMonthIndex={userMonthIndex}
                showAllUsers={showAllUsers}
                monthActiveUserIds={monthActiveUserIds}
                selectedUser={selectedUser}
                onMonthIndexChange={(toOlder) => {
                  setUserMonthIndex((i) => (toOlder ? i + 1 : i - 1));
                  setShowAllUsers(false);
                }}
                onShowAllUsersChange={setShowAllUsers}
                onSelectUser={setSelectedUser}
              />
            </TabsContent>

            <TabsContent value="theme" className="space-y-8">
              <AdminThemeTab season={season} onSeasonChange={setSeason} />
            </TabsContent>
          </Tabs>

          <EventAttendeesDialog
            eventName={selectedEventName}
            open={!!selectedEventName}
            onOpenChange={(o) => !o && setSelectedEventName(null)}
            users={users}
            visits={visits}
          />
          <EditMassageDialog
            massage={editingMassage}
            open={!!editingMassage}
            onOpenChange={(o) => !o && setEditingMassage(null)}
            onSave={handleSaveMassage}
          />
          <CreateMassageDialog
            open={showCreateMassage}
            onOpenChange={setShowCreateMassage}
            onSave={handleCreateMassage}
          />
          <AddClassDialog
            open={addClassDayIndex !== null}
            dayName={addClassDayIndex !== null ? schedule[addClassDayIndex]?.day || "" : ""}
            onOpenChange={(o) => !o && setAddClassDayIndex(null)}
            onSave={(cls) => {
              if (addClassDayIndex !== null) handleAddClass(addClassDayIndex, cls);
            }}
          />
          <CreateEventDialog
            open={showCreateEvent}
            onOpenChange={setShowCreateEvent}
            onSave={handleCreateEvent}
          />
          <CreateMembershipDialog
            open={showCreateMembership}
            onOpenChange={setShowCreateMembership}
            onSave={handleCreateMembership}
          />
        </div>
      </section>
    </Layout>
  );
};

export default AdminPage;
