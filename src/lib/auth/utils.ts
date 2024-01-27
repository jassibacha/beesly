import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function syncUser() {
  // Get the current Clerk user
  const clerkUser = await currentUser();

  // If no user is logged in, return null
  if (!clerkUser?.id) {
    return null;
  }

  // Check if user exists in the database first
  //let user = await db.select().from(users).where(eq(users.id, clerkUser.id));
  let user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, clerkUser.id),
  });

  if (!user) {
    // Create the user
    await db.insert(users).values({
      id: clerkUser.id,
      username: clerkUser.username ?? "",
      displayName: `${clerkUser.firstName} ${clerkUser.lastName}`,
      userImage: clerkUser.imageUrl,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      onboarded: false,
    });

    // Get the user again to return
    // user = await db.select().from(users).where(eq(users.id, clerkUser.id));
    user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, clerkUser.id),
    });
  }

  // Return the user
  return user;
}

// Types for Clerk user data
// interface ClerkUserData {
//   id: string;
//   username: string;
//   first_name: string;
//   last_name: string;
//   image_url: string;
//   email_addresses: { email_address: string }[];
// }

// export async function handleUser(
//   clerkUserData: ClerkUserData,
//   action: "create" | "update" | "delete",
// ) {
//   switch (action) {
//     case "create":
//       return await db.insert(users).values({
//         id: clerkUserData.id,
//         username: clerkUserData.username ?? "",
//         displayName: `${clerkUserData.first_name} ${clerkUserData.last_name}`,
//         userImage: clerkUserData.image_url,
//         email: clerkUserData.email_addresses[0]?.email_address ?? "",
//       });

//     case "update":
//       return await db
//         .update(users)
//         .set({
//           username: clerkUserData.username ?? "",
//           displayName: `${clerkUserData.first_name} ${clerkUserData.last_name}`,
//           userImage: clerkUserData.image_url,
//           email: clerkUserData.email_addresses[0]?.email_address ?? "",
//         })
//         .where(eq(users.id, clerkUserData.id));

//     case "delete":
//       return await db.delete(users).where(eq(users.id, clerkUserData.id));

//     default:
//       throw new Error("Invalid action for handleUser function");
//   }
// }
