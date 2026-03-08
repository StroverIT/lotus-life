"use client";

import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { DaySchedule, YogaClass } from "@/types/catalog";

type AdminScheduleTabProps = {
  schedule: DaySchedule[];
  isLoading?: boolean;
  onAddClass: (dayIndex: number) => void;
  onDeleteClass: (dayIndex: number, classId: string) => void;
};

const AdminScheduleTab = ({ schedule, isLoading, onAddClass, onDeleteClass }: AdminScheduleTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-8 w-24 rounded-md bg-primary/10" />
              <Skeleton className="h-9 w-24 rounded-md bg-primary/10" />
            </div>
            <div className="rounded-xl border-2 border-primary/20 overflow-hidden">
              <div className="border-b border-primary/20 bg-primary/10 p-3 flex gap-4">
                <Skeleton className="h-4 w-14 bg-primary/20" />
                <Skeleton className="h-4 w-20 bg-primary/20" />
                <Skeleton className="h-4 w-16 bg-primary/20" />
                <Skeleton className="h-4 w-12 bg-primary/20" />
                <Skeleton className="h-4 w-20 bg-primary/20" />
                <Skeleton className="h-4 w-14 ml-auto bg-primary/20" />
              </div>
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className={`p-3 flex gap-4 items-center border-b border-border last:border-0 ${j % 2 === 0 ? "bg-card" : "bg-primary/[0.04]"}`}
                >
                  <Skeleton className="h-4 w-12 bg-primary/10" />
                  <Skeleton className="h-5 w-28 bg-primary/10" />
                  <Skeleton className="h-4 w-14 bg-primary/10" />
                  <Skeleton className="h-4 w-16 bg-primary/10" />
                  <Skeleton className="h-4 w-20 bg-primary/10" />
                  <div className="ml-auto flex gap-1">
                    <Skeleton className="h-8 w-8 rounded-md bg-primary/10" />
                    <Skeleton className="h-8 w-8 rounded-md bg-primary/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {schedule.map((day, dayIndex) => (
        <div key={day.day} className="rounded-xl border-2 border-primary/20 overflow-hidden shadow-sm p-5 pb-6">
          <div className="flex items-center justify-between mb-5 px-0">
            <h3 className="font-display text-2xl text-foreground">{day.day}</h3>
            <Button
              variant="default"
              size="sm"
              className="text-xs bg-primary hover:bg-primary/90"
              onClick={() => onAddClass(dayIndex)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Class
            </Button>
          </div>
          {day.classes.length === 0 ? (
            <p className="text-muted-foreground text-sm font-body py-6">No classes scheduled</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/10 border-b-2 border-primary/20 hover:bg-primary/10">
                  <TableHead className="font-semibold text-foreground py-4 px-5">Time</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-5">Class</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-5">Duration</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-5">Hall</TableHead>
                  <TableHead className="font-semibold text-foreground py-4 px-5">Instructor</TableHead>
                  <TableHead className="text-right font-semibold text-foreground py-4 px-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {day.classes.map((cls, rowIndex) => (
                  <TableRow
                    key={cls.id}
                    className={`border-border ${rowIndex % 2 === 0 ? "bg-card" : "bg-primary/[0.04]"} hover:bg-primary/5`}
                  >
                    <TableCell className="font-body text-foreground py-4 px-5">{cls.time}</TableCell>
                    <TableCell className="font-display text-lg text-foreground py-4 px-5">{cls.name}</TableCell>
                    <TableCell className="font-body text-muted-foreground py-4 px-5">{cls.duration}</TableCell>
                    <TableCell className="font-body text-muted-foreground py-4 px-5">{cls.hall}</TableCell>
                    <TableCell className="font-body text-muted-foreground py-4 px-5">{cls.instructor}</TableCell>
                    <TableCell className="text-right py-4 px-5">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDeleteClass(dayIndex, cls.id)}
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
    </div>
  );
};

export default AdminScheduleTab;
