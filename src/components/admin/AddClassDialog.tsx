import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { YogaClass } from "@/types/catalog";

interface AddClassDialogProps {
  open: boolean;
  dayName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (cls: YogaClass) => void;
}

const AddClassDialog = ({ open, dayName, onOpenChange, onSave }: AddClassDialogProps) => {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60 min");
  const [hall, setHall] = useState("Pirin Hall");
  const [instructor, setInstructor] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName(""); setTime(""); setDuration("60 min"); setHall("Pirin Hall"); setInstructor(""); setDescription("");
  };

  const handleSave = () => {
    onSave({
      id: crypto.randomUUID(),
      name, time, duration, hall, instructor, description,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Class — {dayName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Class Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hatha Yoga" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time</Label>
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="08:00" />
            </div>
            <div>
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60 min" />
            </div>
          </div>
          <div>
            <Label>Hall</Label>
            <Select value={hall} onValueChange={(v) => setHall(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pirin Hall">Pirin Hall</SelectItem>
                <SelectItem value="Rodopi Hall">Rodopi Hall</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Instructor</Label>
            <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Instructor name" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Class description..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !time.trim() || !instructor.trim()}>Add Class</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;
