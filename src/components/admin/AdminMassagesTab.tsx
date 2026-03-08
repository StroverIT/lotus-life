"use client";

import { useMemo } from "react";
import { Edit, Trash2, Plus, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_MASSAGE_ICON, MASSAGE_ICON_MAP } from "@/lib/massageIconMap";
import type { Massage } from "@/types/catalog";
import type { AdminMassageBookingRow } from "@/components/admin/types";

type AdminMassagesTabProps = {
  massages: Massage[];
  massageBookings: AdminMassageBookingRow[];
  onAddTreatment: () => void;
  onEdit: (massage: Massage) => void;
  onDelete: (id: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: "shown" | "didnt_show" | null) => void;
};

function isAppointmentPast(booking: AdminMassageBookingRow): boolean {
  const appointmentStart = new Date(`${booking.date}T${booking.time}`);
  return appointmentStart.getTime() < Date.now();
}

const AdminMassagesTab = ({
  massages,
  massageBookings,
  onAddTreatment,
  onEdit,
  onDelete,
  onUpdateBookingStatus,
}: AdminMassagesTabProps) => {
  const sortedBookings = useMemo(() => {
    return [...massageBookings].sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`).getTime();
      const db = new Date(`${b.date}T${b.time}`).getTime();
      return da - db;
    });
  }, [massageBookings]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="massages" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-primary/10 p-1 rounded-lg border border-primary/20">
          <TabsTrigger
            value="massages"
            className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Massages
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="massages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-2xl text-foreground">Massage Treatments</h3>
            <Button variant="default" size="sm" onClick={onAddTreatment} className="bg-primary hover:bg-primary/90">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Treatment
            </Button>
          </div>
          <div className="grid gap-4">
            {massages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border-2 border-primary/20 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center shrink-0 shadow-md">
                    {(() => {
                      const Icon = MASSAGE_ICON_MAP[m.iconKey] ?? DEFAULT_MASSAGE_ICON;
                      return <Icon className="w-6 h-6 text-primary-foreground" />;
                    })()}
                  </div>
                  <div>
                    <h4 className="font-display text-xl mb-1 text-foreground">{m.name}</h4>
                    <p className="text-muted-foreground text-sm font-body mb-2">{m.description}</p>
                    <div className="flex gap-4 text-sm font-body">
                      <span className="text-muted-foreground">
                        30 min: <span className="text-primary font-semibold">{m.price30}</span>
                      </span>
                      <span className="text-muted-foreground">
                        60 min: <span className="text-primary font-semibold">{m.price60}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onEdit(m)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(m.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <h3 className="font-display text-2xl text-foreground">Massage Appointments</h3>
          {sortedBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body py-8 text-center">
              No massage appointments
            </p>
          ) : (
            <div className="grid gap-4">
              {sortedBookings.map((booking) => {
                const past = isAppointmentPast(booking);
                const displayName =
                  booking.guestName || (booking.userId ? "Registered user" : "—");
                return (
                  <div
                    key={booking.id}
                    className={`rounded-xl border-2 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      past
                        ? "opacity-80 border-muted-foreground/20"
                        : "border-primary/20 hover:border-primary/40 hover:shadow-md shadow-sm"
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <h4 className="font-display text-lg text-foreground">{booking.massageName}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-body">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                          {booking.time} · {booking.duration} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary shrink-0" />
                          {displayName}
                        </span>
                        {booking.guestEmail && (
                          <span className="text-muted-foreground">{booking.guestEmail}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-body text-muted-foreground whitespace-nowrap">
                        Status:
                      </span>
                      <Select
                        value={booking.status ?? "__none__"}
                        onValueChange={(value) =>
                          onUpdateBookingStatus(
                            booking.id,
                            value === "__none__" ? null : (value as "shown" | "didnt_show")
                          )
                        }
                      >
                        <SelectTrigger
                          className={`w-[140px] h-9 font-medium border-2 ${
                            booking.status === "shown"
                              ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                              : booking.status === "didnt_show"
                                ? "border-destructive/50 bg-destructive/10 text-destructive"
                                : "border-primary/40 bg-primary/10 text-primary"
                          }`}
                        >
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">
                            <span className="text-muted-foreground">—</span>
                          </SelectItem>
                          <SelectItem
                            value="shown"
                            className="focus:bg-green-500/15 focus:text-green-800 dark:focus:text-green-300"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-green-500" /> Shown
                            </span>
                          </SelectItem>
                          <SelectItem
                            value="didnt_show"
                            className="focus:bg-destructive/15 focus:text-destructive"
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-destructive" /> Didn&apos;t show
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMassagesTab;
