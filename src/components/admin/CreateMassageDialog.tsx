import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hand, Layers, Droplets, Flame, Move, Sparkles, type LucideIcon } from "lucide-react";
import type { MassageType } from "@/data/massages";

const ICON_OPTIONS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Hand", value: "Hand", icon: Hand },
  { label: "Layers", value: "Layers", icon: Layers },
  { label: "Droplets", value: "Droplets", icon: Droplets },
  { label: "Flame", value: "Flame", icon: Flame },
  { label: "Move", value: "Move", icon: Move },
  { label: "Sparkles", value: "Sparkles", icon: Sparkles },
];

const iconMap: Record<string, LucideIcon> = { Hand, Layers, Droplets, Flame, Move, Sparkles };

interface CreateMassageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (massage: MassageType) => void;
}

const CreateMassageDialog = ({ open, onOpenChange, onSave }: CreateMassageDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price30, setPrice30] = useState("");
  const [price60, setPrice60] = useState("");
  const [iconKey, setIconKey] = useState("Hand");

  const reset = () => {
    setName(""); setDescription(""); setPrice30(""); setPrice60(""); setIconKey("Hand");
  };

  const handleSave = () => {
    onSave({
      id: crypto.randomUUID(),
      name,
      description,
      price30,
      price60,
      icon: iconMap[iconKey] || Hand,
      benefits: [],
      availableDays: ["Monday", "Thursday", "Friday"],
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New Massage Treatment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Treatment name" />
          </div>
          <div>
            <Label>Icon</Label>
            <Select value={iconKey} onValueChange={setIconKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <opt.icon className="w-4 h-4" /> {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the treatment..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (30 min)</Label>
              <Input value={price30} onChange={(e) => setPrice30(e.target.value)} placeholder="€30" />
            </div>
            <div>
              <Label>Price (60 min)</Label>
              <Input value={price60} onChange={(e) => setPrice60(e.target.value)} placeholder="€45" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !price30.trim() || !price60.trim()}>Create Treatment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMassageDialog;
