"use client";

import { useEffect, useState, useCallback } from "react";
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
import type { Event } from "@/types/schedule";
import { Plus, Pencil, Trash2 } from "lucide-react";

export interface EventSignUpRow {
  id: string;
  eventId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  signedUpAt: string;
}

export function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventSignUps, setEventSignUps] = useState<EventSignUpRow[]>([]);
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
    const [eventsRes, signUpsRes] = await Promise.all([
      fetch("/api/admin/events"),
      fetch("/api/admin/event-sign-ups"),
    ]);
    if (eventsRes.ok) {
      const data = await eventsRes.json();
      setEvents(data);
    }
    if (signUpsRes.ok) {
      const data = await signUpsRes.json();
      setEventSignUps(data);
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
      {events.length === 0 ? (
        <p className="text-charcoal-light">No events yet.</p>
      ) : (
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
      )}
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
      <div className="mt-8">
        <h3 className="font-medium text-charcoal mb-2">Event sign-ups</h3>
        {eventSignUps.length === 0 ? (
          <p className="text-sm text-charcoal-light">No sign-ups yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Name / Email</TableHead>
                <TableHead>Signed up at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventSignUps.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{events.find((e) => e.id === s.eventId)?.title ?? s.eventId}</TableCell>
                  <TableCell>
                    {s.userId ? s.userId : [s.guestName, s.guestEmail].filter(Boolean).join(" — ") || "—"}
                  </TableCell>
                  <TableCell className="text-charcoal-light text-sm">{new Date(s.signedUpAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
