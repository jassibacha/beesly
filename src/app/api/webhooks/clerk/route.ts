import { Webhook } from "svix";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { userCreated, userUpdated, userDeleted } from "./_webhook-actions";

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

  // Get the event type
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${evt.data.id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  try {
    // 👉 If the type is "user.created"
    if (eventType === "user.created") {
      const success = await userCreated(evt.data);
      if (!success) {
        return new Response("Error occurred -- user already exists", {
          status: 400,
        });
      }
    }
    // 👉 If the type is "user.deleted", delete the user record and associated blocks
    if (eventType === "user.updated") {
      const success = await userUpdated(evt.data);
      if (!success) {
        return new Response("Error occurred -- user not found", {
          status: 400,
        });
      }
    }
    // 👉 If the type is "user.deleted", delete the user record and associated blocks
    if (eventType === "user.deleted") {
      if (!evt.data.id) {
        console.error("Error: User ID is missing in the webhook data");
        return new Response("Error occurred -- missing user ID", {
          status: 400,
        });
      }
      const success = await userDeleted(evt.data.id);
      if (!success) {
        return new Response("Error occurred -- user not found", {
          status: 400,
        });
      }
    }
  } catch (err) {
    console.error(`Error running webhook action: ${eventType}`, err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  return new Response("", { status: 200 });
}
