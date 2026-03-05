 "use client";

import { useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { Sun, Snowflake, Edit, Trash2, Plus, Clock, MapPin, User, Crown, Users, Mail, Phone, Calendar, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";
import { weeklySchedule as initialSchedule, yogaEvents as initialEvents, type YogaClass, type DaySchedule } from "@/data/schedule";
import { massageTypes as initialMassages, type MassageType } from "@/data/massages";
import { memberships, type Membership } from "@/data/memberships";
import { sampleUsers, type UserRecord } from "@/data/users";
import { sampleVisits } from "@/data/visits";
import UserDetailDialog from "@/components/admin/UserDetailDialog";
import EventAttendeesDialog from "@/components/admin/EventAttendeesDialog";
import EditMassageDialog from "@/components/admin/EditMassageDialog";
import CreateMassageDialog from "@/components/admin/CreateMassageDialog";
import AddClassDialog from "@/components/admin/AddClassDialog";
import CreateEventDialog from "@/components/admin/CreateEventDialog";
import CreateMembershipDialog from "@/components/admin/CreateMembershipDialog";
import { cn } from "@/lib/utils";

const AdminPage = () => {
  const { season, setSeason } = useTheme();
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [events, setEvents] = useState(initialEvents);
  const [massages, setMassages] = useState<MassageType[]>(initialMassages);
  const [users] = useState<UserRecord[]>(sampleUsers);
  const [membershipPlans, setMembershipPlans] = useState<Membership[]>(memberships);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedEventName, setSelectedEventName] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // CRUD modal states
  const [editingMassage, setEditingMassage] = useState<MassageType | null>(null);
  const [showCreateMassage, setShowCreateMassage] = useState(false);
  const [addClassDayIndex, setAddClassDayIndex] = useState<number | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateMembership, setShowCreateMembership] = useState(false);

  // Month selector state for users tab
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    sampleVisits.forEach((v) => months.add(v.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, []);
  const [userMonthIndex, setUserMonthIndex] = useState(0);
  const currentUserMonth = availableMonths[userMonthIndex] || "";

  // Compute attendance stats per user filtered by selected month
  const userStats = useMemo(() => {
    const stats: Record<string, { classes: number; events: number; classMin: number; eventMin: number }> = {};
    sampleVisits
      .filter((v) => v.date.startsWith(currentUserMonth))
      .forEach((v) => {
        if (!stats[v.userId]) stats[v.userId] = { classes: 0, events: 0, classMin: 0, eventMin: 0 };
        const min = parseInt(v.duration.match(/(\d+)/)?.[1] || "0", 10) * (v.duration.includes("day") ? 480 : 1);
        if (v.type === "class") {
          stats[v.userId].classes++;
          stats[v.userId].classMin += min;
        } else {
          stats[v.userId].events++;
          stats[v.userId].eventMin += min;
        }
      });
    return stats;
  }, [currentUserMonth]);

  // Event attendee counts
  const eventAttendeeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sampleVisits
      .filter((v) => v.type === "event")
      .forEach((v) => {
        counts[v.className] = (counts[v.className] || 0) + 1;
      });
    return counts;
  }, []);

  // Yearly chart data: unique attendees per month
  const monthlyChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames.map((month, i) => {
      const key = `2026-${String(i + 1).padStart(2, "0")}`;
      const uniqueUsers = new Set(sampleVisits.filter((v) => v.date.startsWith(key)).map((v) => v.userId));
      return { month, attendees: uniqueUsers.size };
    });
  }, []);

  // Users who attended in the selected month
  const monthActiveUserIds = useMemo(() => {
    return new Set(sampleVisits.filter((v) => v.date.startsWith(currentUserMonth)).map((v) => v.userId));
  }, [currentUserMonth]);

  const displayedUsers = useMemo(() => {
    if (showAllUsers) return users;
    return users.filter((u) => monthActiveUserIds.has(u.id));
  }, [showAllUsers, users, monthActiveUserIds]);

  const deleteClass = (dayIndex: number, classId: string) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIndex ? { ...d, classes: d.classes.filter((c) => c.id !== classId) } : d
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteMassage = (id: string) => {
    setMassages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveMassage = (updated: MassageType) => {
    setMassages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleCreateMassage = (massage: MassageType) => {
    setMassages((prev) => [...prev, massage]);
  };

  const handleAddClass = (dayIndex: number, cls: import("@/data/schedule").YogaClass) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === dayIndex ? { ...d, classes: [...d.classes, cls] } : d))
    );
  };

  const handleCreateEvent = (event: typeof events[0]) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleCreateMembership = (plan: Membership) => {
    setMembershipPlans((prev) => [...prev, plan]);
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

            {/* Yoga Schedule */}
            <TabsContent value="schedule" className="space-y-8">
              {schedule.map((day, dayIndex) => (
                <div key={day.day}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-2xl">{day.day}</h3>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setAddClassDayIndex(dayIndex)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Class
                    </Button>
                  </div>
                  {day.classes.length === 0 ? (
                    <p className="text-muted-foreground text-sm font-body py-4">No classes scheduled</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Hall</TableHead>
                          <TableHead>Instructor</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {day.classes.map((cls) => (
                          <TableRow key={cls.id}>
                            <TableCell className="font-body">{cls.time}</TableCell>
                            <TableCell className="font-display text-lg">{cls.name}</TableCell>
                            <TableCell className="font-body text-muted-foreground">{cls.duration}</TableCell>
                            <TableCell className="font-body text-muted-foreground">{cls.hall}</TableCell>
                            <TableCell className="font-body text-muted-foreground">{cls.instructor}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => deleteClass(dayIndex, cls.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* Events */}
            <TabsContent value="events" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-2xl">Upcoming Events</h3>
                <Button variant="outline" size="sm" onClick={() => setShowCreateEvent(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
                </Button>
              </div>
              {events.length === 0 ? (
                <p className="text-muted-foreground text-sm font-body py-8 text-center">No events scheduled</p>
              ) : (
                <div className="grid gap-4">
                  {events.map((event) => (
                    <div key={event.id} className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-display text-xl mb-1">{event.name}</h4>
                        <p className="text-muted-foreground text-sm font-body mb-2">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.date} · {event.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.hall}</span>
                          <span className="text-primary font-medium">{event.price}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {eventAttendeeCounts[event.name] || 0} signed up
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setSelectedEventName(event.name)}
                          >
                            <Eye className="w-3 h-3 mr-1" /> View Attendees
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Massages */}
            <TabsContent value="massages" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-2xl">Massage Treatments</h3>
                <Button variant="outline" size="sm" onClick={() => setShowCreateMassage(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Treatment
                </Button>
              </div>
              <div className="grid gap-4">
                {massages.map((m) => (
                  <div key={m.id} className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shrink-0">
                        <m.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-display text-xl mb-1">{m.name}</h4>
                        <p className="text-muted-foreground text-sm font-body mb-2">{m.description}</p>
                        <div className="flex gap-4 text-sm font-body">
                          <span>30 min: <span className="text-primary font-semibold">{m.price30}</span></span>
                          <span>60 min: <span className="text-primary font-semibold">{m.price60}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingMassage(m)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteMassage(m.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Memberships */}
            <TabsContent value="memberships" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-2xl">Membership Plans</h3>
                <Button variant="outline" size="sm" onClick={() => setShowCreateMembership(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Plan
                </Button>
              </div>
              <div className="grid gap-4">
                {membershipPlans.map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-display text-xl">{plan.name}</h4>
                          {plan.badge && (
                            <Badge variant="secondary" className="text-xs">{plan.badge}</Badge>
                          )}
                        </div>
                        <p className="text-primary font-display text-lg font-semibold mb-2">
                          {plan.price} <span className="text-muted-foreground text-sm font-body font-normal">/ {plan.period}</span>
                        </p>
                        <ul className="text-muted-foreground text-sm font-body space-y-1">
                          {plan.features.slice(0, 3).map((f) => (
                            <li key={f}>• {f}</li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs">+{plan.features.length - 3} more features</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setMembershipPlans((prev) => prev.filter((p) => p.id !== plan.id))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Users */}
            <TabsContent value="users" className="space-y-6">
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
                    onClick={() => { setUserMonthIndex((i) => i + 1); setShowAllUsers(false); }}
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
                    onClick={() => { setUserMonthIndex((i) => i - 1); setShowAllUsers(false); }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Toggle: show month attendees vs all users */}
              <div className="flex items-center gap-3">
                <Badge variant={!showAllUsers ? "default" : "secondary"} className="cursor-pointer" onClick={() => setShowAllUsers(false)}>
                  Attended this month ({monthActiveUserIds.size})
                </Badge>
                <Badge variant={showAllUsers ? "default" : "secondary"} className="cursor-pointer" onClick={() => setShowAllUsers(true)}>
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
                    const plan = memberships.find((m) => m.id === user.membershipId);
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
                             <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</div>
                             <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</div>
                           </div>
                         </TableCell>
                         <TableCell>
                           {plan ? (
                             <Badge variant={plan.highlighted ? "default" : "secondary"}>{plan.name}</Badge>
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
                           <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelectedUser(user)}>
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
              <UserDetailDialog user={selectedUser} open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)} />
             </TabsContent>

            {/* Theme */}
            <TabsContent value="theme" className="space-y-8">
              <h3 className="font-display text-2xl">Seasonal Theme</h3>
              <p className="text-muted-foreground font-body">
                Switch between summer and winter color palettes. The change applies across the entire site.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
                <button
                  onClick={() => setSeason("summer")}
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
                  onClick={() => setSeason("winter")}
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
            </TabsContent>
          </Tabs>
          <EventAttendeesDialog eventName={selectedEventName} open={!!selectedEventName} onOpenChange={(o) => !o && setSelectedEventName(null)} />
          <EditMassageDialog massage={editingMassage} open={!!editingMassage} onOpenChange={(o) => !o && setEditingMassage(null)} onSave={handleSaveMassage} />
          <CreateMassageDialog open={showCreateMassage} onOpenChange={setShowCreateMassage} onSave={handleCreateMassage} />
          <AddClassDialog open={addClassDayIndex !== null} dayName={addClassDayIndex !== null ? schedule[addClassDayIndex]?.day || "" : ""} onOpenChange={(o) => !o && setAddClassDayIndex(null)} onSave={(cls) => { if (addClassDayIndex !== null) handleAddClass(addClassDayIndex, cls); }} />
          <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} onSave={handleCreateEvent} />
          <CreateMembershipDialog open={showCreateMembership} onOpenChange={setShowCreateMembership} onSave={handleCreateMembership} />
        </div>
      </section>
    </Layout>
  );
};

export default AdminPage;
