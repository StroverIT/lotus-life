"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DaySchedule, ClassItem, Event } from "@/types/schedule";
import type { PricingTierData } from "@/lib/pricing";
import { Home, Plus, Pencil, Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LOCATIONS = ["pirin", "rodopi"] as const;

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-charcoal">Admin</h1>
        <Button variant="outline" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Home
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <ScheduleTab />
        </TabsContent>
        <TabsContent value="events">
          <EventsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="memberships">
          <MembershipsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScheduleTab() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editDay, setEditDay] = useState<DaySchedule | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/schedules");
    if (res.ok) {
      const data = await res.json();
      setSchedule(data.schedule ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!editDay) return;
    setSaving(true);
    const updated = schedule.map((d) => (d.day === editDay.day ? editDay : d));
    const res = await fetch("/api/admin/schedules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule: updated }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setSchedule(data.schedule ?? []);
      setEditDay(null);
    }
  };

  const addClass = (day: DaySchedule) => {
    const newClass: ClassItem = { time: "09:00", name: "", location: "rodopi" };
    setEditDay({
      ...day,
      classes: [...day.classes, newClass],
    });
  };

  const removeClass = (day: DaySchedule, index: number) => {
    setEditDay({
      ...day,
      classes: day.classes.filter((_, i) => i !== index),
    });
  };

  const updateClass = (day: DaySchedule, index: number, field: keyof ClassItem, value: string) => {
    const next = [...day.classes];
    next[index] = { ...next[index], [field]: value };
    setEditDay({ ...day, classes: next });
  };

  if (loading) return <p className="text-charcoal-light">Loading schedule…</p>;

  const display = editDay ? schedule.map((d) => (d.day === editDay.day ? editDay : d)) : schedule;

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-light">Base weekly schedule. Edit a day to change its classes.</p>
      <div className="space-y-4">
        {display.map((day) => (
          <div key={day.day} className="border rounded-lg p-4 bg-cream">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-charcoal">{day.day}</h3>
              {!editDay || editDay.day !== day.day ? (
                <Button size="sm" variant="outline" onClick={() => setEditDay(day)}>
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addClass(editDay)}>
                    <Plus className="w-4 h-4 mr-1" /> Add class
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleSave} disabled={saving}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditDay(null)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <ul className="space-y-1 text-sm">
              {(editDay?.day === day.day ? editDay.classes : day.classes).map((c, i) => (
                <li key={i} className="flex items-center gap-2 flex-wrap">
                  {editDay?.day === day.day ? (
                    <>
                      <Input
                        className="w-20 h-8"
                        value={c.time}
                        onChange={(e) => updateClass(editDay, i, "time", e.target.value)}
                        placeholder="Time"
                      />
                      <Input
                        className="w-40 h-8"
                        value={c.name}
                        onChange={(e) => updateClass(editDay, i, "name", e.target.value)}
                        placeholder="Class name"
                      />
                      <select
                        className="h-8 rounded border px-2 text-sm"
                        value={c.location}
                        onChange={(e) => updateClass(editDay, i, "location", e.target.value)}
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <Button size="sm" variant="ghost" onClick={() => removeClass(editDay, i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <span>{c.time} – {c.name} ({c.location})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Event>>({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    location: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveEvent = async () => {
    if (!form.title || !form.date || !form.time || !form.location) return;
    const url = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events";
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? form : { ...form, id: undefined };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await load();
      setOpen(false);
      setEditingId(null);
      setForm({ title: "", date: new Date().toISOString().slice(0, 10), time: "10:00", location: "", description: "" });
    }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/events/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      setDeleteId(null);
    }
  };

  if (loading) return <p className="text-charcoal-light">Loading events…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setForm({ title: "", date: new Date().toISOString().slice(0, 10), time: "10:00", location: "", description: "" }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add event
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((ev) => (
            <TableRow key={ev.id}>
              <TableCell>{ev.title}</TableCell>
              <TableCell>{ev.date}</TableCell>
              <TableCell>{ev.time}</TableCell>
              <TableCell>{ev.location}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => { setForm(ev); setEditingId(ev.id); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(ev.id)}><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit event" : "Add event"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Date (YYYY-MM-DD)</Label>
              <Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Time</Label>
              <Input value={form.time ?? ""} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveEvent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface UserRow {
  email: string;
  name: string;
  role: string;
}

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setEditName(u.name);
    setEditRole(u.role as "user" | "admin");
    setEditPassword("");
  };

  const saveUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const body: { name?: string; role?: string; password?: string } = { name: editName, role: editRole };
    if (editPassword.trim()) body.password = editPassword;
    const res = await fetch(`/api/admin/users/${encodeURIComponent(editUser.email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      await load();
      setEditUser(null);
    }
  };

  if (loading) return <p className="text-charcoal-light">Loading users…</p>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.email}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Email</Label>
              <Input value={editUser?.email ?? ""} disabled />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <select className="w-full h-10 rounded-md border px-3" value={editRole} onChange={(e) => setEditRole(e.target.value as "user" | "admin")}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <Label>New password (leave blank to keep)</Label>
              <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveUser} disabled={saving}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MembershipsTab() {
  const [subTab, setSubTab] = useState<"tiers" | "assignments">("tiers");
  return (
    <div className="space-y-4">
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as "tiers" | "assignments")}>
        <TabsList>
          <TabsTrigger value="tiers">Pricing tiers</TabsTrigger>
          <TabsTrigger value="assignments">User assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="tiers">
          <TiersSubTab />
        </TabsContent>
        <TabsContent value="assignments">
          <UserAssignmentsSubTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TiersSubTab() {
  const [tiers, setTiers] = useState<PricingTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PricingTierData>>({
    name: "",
    price: 0,
    features: [],
    highlighted: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [featuresText, setFeaturesText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tiers");
    if (res.ok) {
      const data = await res.json();
      setTiers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveTier = async () => {
    if (!form.name || typeof form.price !== "number") return;
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
    const url = editingId ? `/api/admin/tiers/${editingId}` : "/api/admin/tiers";
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...form, features } : { ...form, id: form.id, features };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await load();
      setOpen(false);
      setEditingId(null);
      setForm({ name: "", price: 0, features: [], highlighted: false });
      setFeaturesText("");
    }
  };

  const doDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/tiers/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      setDeleteId(null);
    }
  };

  const openEdit = (t: PricingTierData) => {
    setForm(t);
    setFeaturesText(t.features.join("\n"));
    setEditingId(t.id);
    setOpen(true);
  };

  if (loading) return <p className="text-charcoal-light">Loading tiers…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingId(null); setForm({ name: "", price: 0, features: [], highlighted: false }); setFeaturesText(""); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add tier
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Features</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((t) => (
            <TableRow key={t.id}>
              <TableCell>{t.id}</TableCell>
              <TableCell>{t.name}</TableCell>
              <TableCell>€{t.price}</TableCell>
              <TableCell className="max-w-[200px] truncate">{t.features.join(", ")}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(t.id)}><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit tier" : "Add tier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingId && (
              <div>
                <Label>ID (optional)</Label>
                <Input value={form.id ?? ""} onChange={(e) => setForm({ ...form, id: e.target.value || undefined })} placeholder="e.g. essence" />
              </div>
            )}
            <div>
              <Label>Name</Label>
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <textarea className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="highlighted" checked={form.highlighted ?? false} onChange={(e) => setForm({ ...form, highlighted: e.target.checked })} />
              <Label htmlFor="highlighted">Highlighted</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveTier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tier?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface AssignmentRow {
  userId: string;
  tierId: string;
  userEmail?: string;
  userName?: string;
  tierName?: string;
  validFrom?: string;
  validTo?: string;
}

function UserAssignmentsSubTab() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tiers, setTiers] = useState<PricingTierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignTierId, setAssignTierId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [aRes, uRes, tRes] = await Promise.all([
      fetch("/api/admin/user-memberships"),
      fetch("/api/admin/users"),
      fetch("/api/admin/tiers"),
    ]);
    if (aRes.ok) setAssignments(await aRes.json());
    if (uRes.ok) setUsers(await uRes.json());
    if (tRes.ok) setTiers(await tRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async () => {
    if (!assignUserId || !assignTierId) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/user-memberships", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: assignUserId, tierId: assignTierId }),
    });
    setSubmitting(false);
    if (res.ok) {
      await load();
      setAssignUserId("");
      setAssignTierId("");
    }
  };

  const doRemove = async () => {
    if (!deleteUserId) return;
    const res = await fetch(`/api/admin/user-memberships?userId=${encodeURIComponent(deleteUserId)}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      setDeleteUserId(null);
    }
  };

  if (loading) return <p className="text-charcoal-light">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 p-4 border rounded-lg bg-cream">
        <div>
          <Label className="text-xs">User</Label>
          <select className="h-10 rounded-md border px-3 ml-2" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}>
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>{u.email}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Tier</Label>
          <select className="h-10 rounded-md border px-3 ml-2" value={assignTierId} onChange={(e) => setAssignTierId(e.target.value)}>
            <option value="">Select tier</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={assign} disabled={submitting || !assignUserId || !assignTierId}>Assign</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a) => (
            <TableRow key={a.userId}>
              <TableCell>{a.userEmail ?? a.userName ?? a.userId}</TableCell>
              <TableCell>{a.tierName ?? a.tierId}</TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => setDeleteUserId(a.userId)}><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove membership?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the tier assignment for this user.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
