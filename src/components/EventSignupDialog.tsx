import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface EventSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventDay?: string;
  eventTime?: string;
}

const GUEST_KEY = "lotus-life-guest";

function getStoredGuest(): GuestInfo | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.name && parsed.email && parsed.phone) return parsed;
    return null;
  } catch {
    return null;
  }
}

const EventSignupDialog = ({ open, onOpenChange, eventName, eventDay, eventTime }: EventSignupDialogProps) => {
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setGuest(getStoredGuest());
  }, [open]);

  // If user is already logged in, sign up directly and show toast
  useEffect(() => {
    if (open && guest) {
      const detail = [eventDay, eventTime].filter(Boolean).join(" at ");
      toast({
        title: "You're signed up!",
        description: `You've been registered for ${eventName}${detail ? ` on ${detail}` : ""}.`,
      });
      onOpenChange(false);
    }
  }, [open, guest]);

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} sign-in coming soon`,
      description: "Please sign up as a guest for now.",
    });
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    const info: GuestInfo = { name: name.trim(), email: email.trim(), phone: phone.trim() };
    localStorage.setItem(GUEST_KEY, JSON.stringify(info));

    const detail = [eventDay, eventTime].filter(Boolean).join(" at ");
    toast({
      title: "You're signed up!",
      description: `Welcome ${info.name}! You've been registered for ${eventName}${detail ? ` on ${detail}` : ""}.`,
    });

    setGuest(info);
    setName("");
    setEmail("");
    setPhone("");
    onOpenChange(false);
  };

  // Don't render the dialog if user is logged in (handled by effect above)
  if (guest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Sign Up</DialogTitle>
          <DialogDescription className="font-body">
            Reserve your spot for <span className="font-semibold text-foreground">{eventName}</span>
            {eventDay && <> on <span className="font-semibold text-foreground">{eventDay}</span></>}
            {eventTime && <> at <span className="font-semibold text-foreground">{eventTime}</span></>}
          </DialogDescription>
        </DialogHeader>

        {/* Social login buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <Button
            variant="outline"
            className="w-full gap-2 font-body"
            onClick={() => handleSocialLogin("Facebook")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 font-body"
            onClick={() => handleSocialLogin("Google")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-body">
            or continue as guest
          </span>
        </div>

        {/* Guest form */}
        <form onSubmit={handleGuestSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-name" className="font-body">Name</Label>
            <Input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-email" className="font-body">Email</Label>
            <Input id="guest-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-phone" className="font-body">Phone</Label>
            <Input id="guest-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+359 ..." required />
          </div>
          <Button type="submit" className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90 font-body">
            Reserve My Spot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventSignupDialog;
