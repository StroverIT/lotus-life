import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import type { Membership } from "@/types/catalog";

interface CreateMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (membership: Membership) => void;
}

const CreateMembershipDialog = ({ open, onOpenChange, onSave }: CreateMembershipDialogProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("per month");
  const [badge, setBadge] = useState("");
  const [highlighted, setHighlighted] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  const reset = () => {
    setName(""); setPrice(""); setPeriod("per month"); setBadge(""); setHighlighted(false); setFeatures([]); setNewFeature("");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures((prev) => [...prev, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleSave = () => {
    onSave({
      id: crypto.randomUUID(),
      name, price, period, features,
      highlighted: highlighted || undefined,
      badge: badge.trim() || undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create Membership Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Plan Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lotus Premium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="€50" />
            </div>
            <div>
              <Label>Period</Label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="per month" />
            </div>
          </div>
          <div>
            <Label>Badge (optional)</Label>
            <Input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Most Popular" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="highlighted" checked={highlighted} onCheckedChange={(c) => setHighlighted(!!c)} />
            <Label htmlFor="highlighted" className="cursor-pointer">Highlight this plan</Label>
          </div>
          <div>
            <Label>Features</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button type="button" size="icon" variant="outline" onClick={addFeature} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <ul className="mt-2 space-y-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm font-body bg-secondary rounded px-3 py-1.5">
                    <span>{f}</span>
                    <button onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !price.trim()}>Create Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMembershipDialog;
