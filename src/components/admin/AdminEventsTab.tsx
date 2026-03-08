"use client";

import { Clock, MapPin, Edit, Trash2, Plus, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { YogaEvent } from "@/types/catalog";

type AdminEventsTabProps = {
  events: YogaEvent[];
  eventAttendeeCounts: Record<string, number>;
  onAddEvent: () => void;
  onViewAttendees: (eventName: string) => void;
  onDeleteEvent: (id: string) => void;
};

const AdminEventsTab = ({
  events,
  eventAttendeeCounts,
  onAddEvent,
  onViewAttendees,
  onDeleteEvent,
}: AdminEventsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl">Upcoming Events</h3>
        <Button variant="outline" size="sm" onClick={onAddEvent}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
        </Button>
      </div>
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm font-body py-8 text-center">No events scheduled</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <h4 className="font-display text-xl mb-1">{event.name}</h4>
                <p className="text-muted-foreground text-sm font-body mb-2">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {event.dateLabel} · {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.hall}
                  </span>
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
                    onClick={() => onViewAttendees(event.name)}
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
                  onClick={() => onDeleteEvent(event.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventsTab;
