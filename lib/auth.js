import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user?.email) {
    throw new Error("Unauthorized");
  }
  return user;
}
