import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;

const providers = [];

providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      name: { label: "Name", type: "text" },
      phone: { label: "Phone", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        throw new Error("Email and password are required");
      }

      const email = credentials.email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing?.passwordHash) {
        const valid = await bcrypt.compare(credentials.password, existing.passwordHash);
        if (!valid) throw new Error("Invalid email or password");
        return {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          role: existing.role,
        } as any;
      }

      // Auto-register if user does not exist
      const passwordHash = await bcrypt.hash(credentials.password, 10);

      const created = await prisma.user.create({
        data: {
          email,
          name: credentials.name?.trim() || email.split("@")[0],
          phone: credentials.phone?.trim() || null,
          passwordHash,
          authType: "CREDENTIALS",
        },
      });

      return {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
      } as any;
    },
  }),
);

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  );
}

if (facebookClientId && facebookClientSecret) {
  providers.push(
    FacebookProvider({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    }),
  );
}

providers.push(
  CredentialsProvider({
    id: "guest",
    name: "Guest",
    credentials: {},
    async authorize() {
      // Guest users are NOT persisted in the database
      return {
        id: `guest-${crypto.randomUUID()}`,
        name: "Guest",
        email: null,
        role: "USER",
        guest: true,
      } as any;
    },
  }),
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = (user as any).id;
        token.role = (user as any).role ?? "USER";
        token.guest = (user as any).guest ?? false;
      }

      if (account && account.provider) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).guest = token.guest ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

