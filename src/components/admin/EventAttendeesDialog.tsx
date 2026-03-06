import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, User } from "lucide-react";
import { useMemo } from "react";

interface EventAttendeesDialogProps {
  eventName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Array<{ id: string; name: string; email: string | null; phone: string | null }>;
  visits: Array<{ id: string; userId: string | null; className: string; type: "CLASS" | "EVENT" }>;
}

const EventAttendeesDialog = ({ eventName, open, onOpenChange, users, visits }: EventAttendeesDialogProps) => {
  const attendees = useMemo(() => {
    if (!eventName) return [];
    const userIds = new Set(
      visits
        .filter((v) => v.type === "EVENT" && v.className === eventName)
        .map((v) => v.userId)
        .filter(Boolean)
    );
    return users.filter((u) => userIds.has(u.id));
  }, [eventName, users, visits]);

  if (!eventName) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{eventName}</DialogTitle>
          <p className="text-sm text-muted-foreground font-body">{attendees.length} attendee{attendees.length !== 1 ? "s" : ""}</p>
        </DialogHeader>

        {attendees.length === 0 ? (
          <p className="text-muted-foreground text-sm font-body text-center py-6">No attendees signed up</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-display">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-sm">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventAttendeesDialog;
