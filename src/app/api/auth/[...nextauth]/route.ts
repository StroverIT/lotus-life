import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { findUserByEmail, addUser, isAdminEmail, upsertUserFromOAuth } from "@/lib/usersStore";
import type { Role } from "@/types/next-auth";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      name: { label: "Name", type: "text" },
      isSignUp: { label: "Is sign up", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      const isSignUp = credentials.isSignUp === "true";
      if (isSignUp) {
        const name = (credentials.name as string)?.trim() || credentials.email.split("@")[0];
        const password = (credentials.password as string)?.trim();
        if (!password) return null;
        const existing = await findUserByEmail(credentials.email);
        if (existing) return null;
        await addUser({
          email: credentials.email,
          password,
          name,
          role: "user",
        });
        return { id: credentials.email, email: credentials.email, name, role: "user" as Role };
      }
      const user = await findUserByEmail(credentials.email);
      if (!user?.password) return null;
      const ok = await bcrypt.compare(credentials.password as string, user.password);
      if (!ok) return null;
      return { id: user.email, email: user.email, name: user.name, role: user.role };
    },
  }),
];
if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role ?? (isAdminEmail(user.email ?? "") ? "admin" : "user");
        // Persist OAuth users to Supabase on first sign-in (store login type: google, facebook, etc.)
        if (account?.provider && account.provider !== "credentials" && user.email) {
          const persisted = await upsertUserFromOAuth(
            user.email,
            user.name ?? null,
            user.image ?? null,
            account.provider
          );
          token.role = persisted.role as Role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: Role }).id = token.id as string;
        (session.user as { role?: Role }).role = (token.role as Role) ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
