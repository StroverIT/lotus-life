"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Facebook, Chrome } from "lucide-react";
import { signIn as signInNextAuth } from "next-auth/react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

function getRedirectParam(params: URLSearchParams | null) {
  const redirect = params?.get("redirect") ?? "/my-account";
  if (!redirect.startsWith("/")) return "/my-account";
  return redirect;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => getRedirectParam(searchParams), [searchParams]);

  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const signIn = async () => {
    setBusy(true);
    try {
      const result = await signInNextAuth("credentials", {
        email: loginEmail.trim(),
        password: loginPassword,
        callbackUrl: redirectTo,
        redirect: true,
      });
      if ((result as any)?.error) {
        throw new Error((result as any).error);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Login failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const register = async () => {
    setBusy(true);
    try {
      const result = await signInNextAuth("credentials", {
        email: regEmail.trim(),
        password: regPassword,
        name: regName,
        phone: regPhone,
        callbackUrl: redirectTo,
        redirect: true,
      });
      if ((result as any)?.error) {
        throw new Error((result as any).error);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Registration failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "facebook") => {
    setBusy(true);
    try {
      const result = await signInNextAuth(provider, {
        callbackUrl: redirectTo,
        redirect: true,
      });
      if ((result as any)?.error) {
        throw new Error((result as any).error);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "OAuth login failed";
      toast.error(message);
      setBusy(false);
    }
  };

  const guest = async () => {
    setBusy(true);
    try {
      const result = await signInNextAuth("guest", {
        callbackUrl: redirectTo,
        redirect: true,
      });
      if ((result as any)?.error) {
        throw new Error((result as any).error);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Guest sign-in failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display text-3xl">Welcome</CardTitle>
                <CardDescription className="font-body">
                  Log in or create an account. Guests can book yoga and massage, but memberships
                  require an account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => oauth("google")}
                    disabled={busy}
                    className="flex items-center justify-center gap-2"
                  >
                    <Chrome className="h-4 w-4 text-primary" />
                    <span>Continue with Google</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => oauth("facebook")}
                    disabled={busy}
                    className="flex items-center justify-center gap-2"
                  >
                    <Facebook className="h-4 w-4 text-primary" />
                    <span>Continue with Facebook</span>
                  </Button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground font-body">or</span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="login">Log in</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="font-body">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="font-body">
                        Password
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    <Button className="w-full gradient-purple text-primary-foreground border-0" onClick={signIn} disabled={busy}>
                      {busy ? "Signing in..." : "Sign in"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="font-body">
                        Name
                      </Label>
                      <Input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="font-body">
                        Phone (optional)
                      </Label>
                      <Input id="reg-phone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="font-body">
                        Email
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="font-body">
                        Password
                      </Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    <Button className="w-full gradient-purple text-primary-foreground border-0" onClick={register} disabled={busy}>
                      {busy ? "Creating..." : "Create account"}
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <Button variant="secondary" className="w-full" onClick={guest} disabled={busy}>
                    Continue as guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}

