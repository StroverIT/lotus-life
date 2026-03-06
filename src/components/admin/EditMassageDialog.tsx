import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Massage } from "@/types/catalog";

interface EditMassageDialogProps {
  massage: Massage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Massage) => void;
}

const EditMassageDialog = ({ massage, open, onOpenChange, onSave }: EditMassageDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price30, setPrice30] = useState("");
  const [price60, setPrice60] = useState("");

  useEffect(() => {
    if (massage) {
      setName(massage.name);
      setDescription(massage.description);
      setPrice30(massage.price30);
      setPrice60(massage.price60);
    }
  }, [massage]);

  const handleSave = () => {
    if (!massage) return;
    onSave({ ...massage, name, description, price30, price60 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Massage Treatment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMassageDialog;
