"use client";

import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DaySchedule, YogaClass } from "@/types/catalog";

type AdminScheduleTabProps = {
  schedule: DaySchedule[];
  onAddClass: (dayIndex: number) => void;
  onDeleteClass: (dayIndex: number, classId: string) => void;
};

const AdminScheduleTab = ({ schedule, onAddClass, onDeleteClass }: AdminScheduleTabProps) => {
  return (
    <div className="space-y-8">
      {schedule.map((day, dayIndex) => (
        <div key={day.day}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-2xl">{day.day}</h3>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => onAddClass(dayIndex)}>
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
