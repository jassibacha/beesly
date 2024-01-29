import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// TODO: Move this to a shared file for types and interfaces
interface ClerkUserData {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_addresses: { email_address?: string }[];
}

// Function to check if a user exists in the database
export async function checkIfUserExists(userId: string): Promise<boolean> {
  const dbUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
  return !!dbUser;
}

// Function to handle 'user.created' webhook event
export async function userCreated(clerkUser: ClerkUserData): Promise<boolean> {
  const userExists = await checkIfUserExists(clerkUser.id);
  if (userExists) {
    return false;
  }
  await db.insert(users).values({
    id: clerkUser.id,
    username: clerkUser.username ?? "",
    displayName: `${clerkUser.first_name} ${clerkUser.last_name}`,
    userImage: clerkUser.image_url,
    email: clerkUser.email_addresses[0]?.email_address ?? "",
    onboarded: false,
  });
  return true;
}

// Function to handle 'user.updated' webhook event
export async function userUpdated(clerkUser: ClerkUserData): Promise<boolean> {
  const userExists = await checkIfUserExists(clerkUser.id);
  if (!userExists) {
    return false;
  }
  await db
    .update(users)
    .set({
      username: clerkUser.username ?? "",
      displayName: `${clerkUser.first_name} ${clerkUser.last_name}`,
      userImage: clerkUser.image_url,
      email: clerkUser.email_addresses[0]?.email_address ?? "",
    })
    .where(eq(users.id, clerkUser.id));
  return true;
}

// Function to handle 'user.deleted' webhook event
export async function userDeleted(userId: string): Promise<boolean> {
  const userExists = await checkIfUserExists(userId);
  // If user does not exist, return false
  if (!userExists) {
    return false;
  }
  await db.delete(users).where(eq(users.id, userId));
  return true;
}
