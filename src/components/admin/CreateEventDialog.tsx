import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: { id: string; name: string; date: string; time: string; duration: string; hall: string; price: string; description: string }) => void;
}

const CreateEventDialog = ({ open, onOpenChange, onSave }: CreateEventDialogProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [hall, setHall] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName(""); setDate(""); setTime(""); setDuration(""); setHall(""); setPrice(""); setDescription("");
  };

  const handleSave = () => {
    onSave({ id: crypto.randomUUID(), name, date, time, duration, hall, price, description });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Event Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Full Moon Sound Bath" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="March 14, 2026" />
            </div>
            <div>
              <Label>Time</Label>
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="20:00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="2 hours" />
            </div>
            <div>
              <Label>Hall</Label>
              <Input value={hall} onChange={(e) => setHall(e.target.value)} placeholder="Pirin Hall" />
            </div>
          </div>
          <div>
            <Label>Price</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="€20" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Event description..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !date.trim()}>Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
