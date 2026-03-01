import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

// Mock users for Credentials (no DB yet). Replace with Supabase later.
const MOCK_USERS: { email: string; password: string; name: string }[] = [
  { email: "demo@lotuslife.com", password: "demo123", name: "Demo User" },
];

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
        const existing = MOCK_USERS.find((u) => u.email === credentials.email);
        if (existing) return null;
        MOCK_USERS.push({
          email: credentials.email,
          password,
          name,
        });
        return { id: credentials.email, email: credentials.email, name };
      }
      const user = MOCK_USERS.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );
      if (!user) return null;
      return { id: user.email, email: user.email, name: user.name };
    },
  }),
];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}
if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
