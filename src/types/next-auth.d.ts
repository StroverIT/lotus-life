import "next-auth";

export type Role = "user" | "admin";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: Role;
  }

  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: Role;
    };
  }
}
