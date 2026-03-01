"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/panel";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        name: name.trim(),
        isSignUp: String(isSignUp),
        redirect: false,
      });
      if (res?.error) {
        setError(isSignUp ? "Sign up failed. Email may already be in use." : "Invalid email or password.");
        setLoading(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-marble px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-cream rounded-2xl shadow-soft p-8 border border-border">
          <h1 className="font-display text-3xl text-charcoal mb-2 text-center">
            {isSignUp ? "Create account" : "Sign in"}
          </h1>
          <p className="text-charcoal-light text-sm font-body text-center mb-8">
            Use your account to access the panel and track your visits.
          </p>

          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal font-body">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-charcoal font-body">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal font-body">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive font-body">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-sage text-cream hover:bg-sage-dark font-body"
              disabled={loading}
            >
              {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full mt-4 text-sm text-charcoal-light hover:text-sage font-body"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-charcoal-light text-sm font-body text-center mb-4">
              Or continue with
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full font-body border-border"
                onClick={() => signIn("google", { callbackUrl })}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full font-body border-border"
                onClick={() => signIn("facebook", { callbackUrl })}
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-charcoal-light text-sm font-body">
          <Link href="/" className="hover:text-sage">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-marble"><p className="text-charcoal-light font-body">Loading…</p></div>}>
      <SignInForm />
    </Suspense>
  );
}
