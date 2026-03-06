"use client";

import { useEffect, useRef, useState } from "react";
import { Chrome, Facebook } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export interface AuthOptionsProps {
  /** Callback when guest form is submitted with valid name, email, phone. */
  onGuestSubmit?: (data: { name: string; email: string; phone: string }) => void;
  /** Disable form and submit button while parent is processing (e.g. booking in flight). */
  busy?: boolean;
  /** When this value changes, the guest form fields are reset to empty. */
  resetSignal?: unknown;
  /** Where to send the user after OAuth redirect. */
  callbackUrl?: string;
  /** If true, OAuth uses redirect. */
  redirect?: boolean;
  /** Optional title shown above the buttons. */
  title?: string;
  /** Optional description. */
  description?: string;
  className?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthOptions({
  onGuestSubmit,
  busy = false,
  resetSignal,
  callbackUrl = "/",
  redirect = true,
  title,
  description,
  className,
}: AuthOptionsProps) {
  const [oauthBusy, setOauthBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const prevResetSignalRef = useRef(resetSignal);

  useEffect(() => {
    if (prevResetSignalRef.current !== resetSignal) {
      prevResetSignalRef.current = resetSignal;
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [resetSignal]);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthBusy(true);
    try {
      const res = await signIn(provider, {
        callbackUrl,
        redirect,
      });
      if ((res as any)?.error) throw new Error((res as any).error);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Sign-in failed";
      toast.error(message);
    } finally {
      setOauthBusy(false);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!trimmedPhone) {
      toast.error("Telephone number is required");
      return;
    }
    onGuestSubmit?.({ name: trimmedName, email: trimmedEmail, phone: trimmedPhone });
  };

  const isFormDisabled = busy || oauthBusy;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {title && (
        <p className="text-sm font-medium text-foreground font-body">{title}</p>
      )}
      {description && (
        <p className="text-sm text-muted-foreground font-body">{description}</p>
      )}
      <Button
        variant="outline"
        className="w-full gap-2 font-body"
        onClick={() => handleOAuth("google")}
        disabled={isFormDisabled}
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2 font-body"
        onClick={() => handleOAuth("facebook")}
        disabled={isFormDisabled}
      >
        <Facebook className="h-4 w-4" />
        Continue with Facebook
      </Button>
      <div className="relative my-1">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-body">
          or
        </span>
      </div>
      <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3">
        <div className="space-y-2">
          <Label htmlFor="guest-name" className="font-body">
            Name
          </Label>
          <Input
            id="guest-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isFormDisabled}
            required
            className="font-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest-email" className="font-body">
            Email
          </Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isFormDisabled}
            required
            className="font-body"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guest-phone" className="font-body">
            Telephone
          </Label>
          <Input
            id="guest-phone"
            type="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isFormDisabled}
            required
            className="font-body"
          />
        </div>
        <Button
          type="submit"
          className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90 font-body"
          disabled={isFormDisabled}
        >
          Confirm booking
        </Button>
      </form>
    </div>
  );
}
