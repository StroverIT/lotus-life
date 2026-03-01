"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DaySchedule, ClassItem } from "@/types/schedule";
import { Plus, Pencil, Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const LOCATIONS = ["pirin", "rodopi"] as const;

export interface ScheduleSignUpRow {
  id: string;
  scheduleSlotId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  signedUpAt: string;
}

export function ScheduleTab() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [scheduleSignUps, setScheduleSignUps] = useState<ScheduleSignUpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editDay, setEditDay] = useState<DaySchedule | null>(null);

  const load = useCallback(async () => {
    const [schedRes, signUpsRes] = await Promise.all([
      fetch("/api/admin/schedules"),
      fetch("/api/admin/schedule-sign-ups"),
    ]);
    if (schedRes.ok) {
      const data = await schedRes.json();
      setSchedule(data.schedule ?? []);
    }
    if (signUpsRes.ok) {
      const data = await signUpsRes.json();
      setScheduleSignUps(data);
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
      {schedule.length === 0 ? (
        <p className="text-charcoal-light">No schedule data.</p>
      ) : (
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
      )}
      <div className="mt-8">
        <h3 className="font-medium text-charcoal mb-2">Schedule sign-ups</h3>
        {scheduleSignUps.length === 0 ? (
          <p className="text-sm text-charcoal-light">No sign-ups yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Name / Email</TableHead>
                <TableHead>Signed up at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleSignUps.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.scheduleSlotId}</TableCell>
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
