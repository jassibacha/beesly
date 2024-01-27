import { Webhook } from "svix";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  console.log("Webhook Received: Clerk");
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  // const payload = await req.json();
  const payload = (await req.json()) as Record<string, unknown>; // Taken from https://github.com/jaronheard/Soonlist/blob/main/app/api/webhooks/clerk/route.ts
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  // const { id, username, email, first_name, last_name, image_url } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${evt.data.id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  // 👉 If the type is "user.updated" the important values in the database will be updated in the users table
  if (eventType === "user.updated") {
    try {
      // Check if user exists, or null if not found
      const dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, evt.data.id ?? ""),
      });

      // If user does not exist, return an error
      if (!dbUser) {
        return new Response("Error occured -- user not found in database", {
          status: 400,
        });
      }

      await db
        .update(users)
        .set({
          username: evt.data.username ?? "",
          displayName: `${evt.data.first_name} ${evt.data.last_name}`,
          userImage: evt.data.image_url,
          email: evt.data.email_addresses[0]?.email_address ?? "",
        })
        .where(eq(users.id, evt.data.id));
    } catch (err) {
      console.error("Error updating user:", err);
      return new Response("Error occurred in user update", { status: 500 });
    }
  }

  // 👉 If the type is "user.created" create a record in the users table
  if (eventType === "user.created") {
    try {
      // Check if user exists, or null if not found
      const dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, evt.data.id ?? ""),
      });

      // If user does exist, return an error
      if (dbUser) {
        return new Response("Error occured -- user already exists", {
          status: 400,
        });
      }

      await db.insert(users).values({
        id: evt.data.id,
        username: evt.data.username ?? "",
        displayName: `${evt.data.first_name} ${evt.data.last_name}`,
        userImage: evt.data.image_url,
        email: evt.data.email_addresses[0]?.email_address ?? "",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      return new Response("Error occurred in user creation", { status: 500 });
    }
  }

  // 👉 If the type is "user.deleted", delete the user record and associated blocks
  if (eventType === "user.deleted") {
    try {
      // Check if user exists, or null if not found
      const dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, evt.data.id ?? ""),
      });

      // If user does not exist, return an error
      if (!dbUser) {
        return new Response("Error occured -- user not found in database", {
          status: 400,
        });
      }

      await db.delete(users).where(eq(users.id, evt.data.id ?? ""));
    } catch (err) {
      console.error("Error deleting user:", err);
      return new Response("Error occurred in user deletion", { status: 500 });
    }
  }

  return new Response("Webhook processed successfully", { status: 201 });

  // if (eventType === "user.created") {
  //   console.log("Clerk User created: ", evt.data.id);
  //   // Get the user ID
  //   const userId = evt.data.id;

  //   // Check if user exists in the database
  //   const dbUser = await db.select().from(users).where(eq(users.id, userId));

  //   // If user does not exist, create a new user with their id
  //   if (dbUser.length === 0) {
  //     await db.insert(users).values({
  //       id: userId,
  //     });
  //   }
  //   console.log("DB User created, id: ", userId);

  //   // Respond with success
  //   return new Response("Webhook processed successfully", { status: 200 });
  // }
}
