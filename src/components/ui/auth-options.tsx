"use client";

import { useState } from "react";
import { Chrome, Facebook } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export interface AuthOptionsProps {
  /** Callback after successful sign-in when using redirect: false (e.g. guest). */
  onSuccess?: () => void;
  /** Where to send the user after OAuth redirect. Ignored when redirect is false. */
  callbackUrl?: string;
  /** If true, OAuth and guest use redirect; if false, sign in in-place and call onSuccess for guest. */
  redirect?: boolean;
  /** Label for the guest button. */
  guestLabel?: string;
  /** Optional title shown above the buttons. */
  title?: string;
  /** Optional description. */
  description?: string;
  className?: string;
}

export function AuthOptions({
  onSuccess,
  callbackUrl = "/",
  redirect = true,
  guestLabel = "Continue as guest",
  title,
  description,
  className,
}: AuthOptionsProps) {
  const [busy, setBusy] = useState(false);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setBusy(true);
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
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    setBusy(true);
    try {
      const res = await signIn("guest", {
        callbackUrl,
        redirect: redirect ? true : false,
      });
      if ((res as any)?.error) throw new Error((res as any).error);
      if (!redirect) {
        toast.success("Signed in as guest");
        onSuccess?.();
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Guest sign-in failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

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
        disabled={busy}
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2 font-body"
        onClick={() => handleOAuth("facebook")}
        disabled={busy}
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
      <Button
        type="button"
        className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90 font-body"
        onClick={handleGuest}
        disabled={busy}
      >
        {guestLabel}
      </Button>
    </div>
  );
}
