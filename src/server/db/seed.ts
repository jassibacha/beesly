import { db } from "./index";
import { v4 as uuidv4 } from "uuid";
import {
  bookings,
  locationSettings,
  locations,
  resourceBookings,
  resources,
  users,
} from "./schema";

// Seeding tsx instructions
// https://discord.com/channels/966627436387266600/1200193597870448780/1200222130093162496
// Make a gist

// Grab the userId from the env file to link the seed data correctly
const ownerId = process.env.OWNER_ID ?? "user_test_asx79aSjsx7U";

// Tables in reverse order of dependency for wiping
const tablesToWipe = [
  resourceBookings,
  bookings,
  resources,
  locationSettings,
  locations,
  users,
];

async function wipeTables() {
  try {
    for (const table of tablesToWipe) {
      await db.delete(table).execute();
    }
    console.log("Tables wiped successfully");
  } catch (error) {
    console.error("Error wiping tables:", error);
  }
}

async function seedDatabase() {
  try {
    // User details
    await db.insert(users).values({
      id: ownerId,
      email: "owner@example.com",
      username: "ownerUsername",
      displayName: "Owner Display Name",
      userImage: "https://example.com/user_image.jpg",
      onboarded: true,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Location details
    const locationId = uuidv4();
    await db.insert(locations).values({
      id: locationId,
      ownerId,
      name: "Sample Location",
      slug: "sample-location",
      type: "VR Arcade",
      phone: "123-456-7890",
      email: "location@example.com",
      website: "https://examplelocation.com",
      streetAddress: "123 Example St",
      city: "Example City",
      state: "EX",
      zipCode: "12345",
      country: "Exampleland",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Location Settings details
    await db.insert(locationSettings).values({
      id: uuidv4(),
      locationId,
      timeZone: "America/Los_Angeles",
      dailyAvailability: JSON.stringify({
        Monday: { open: "09:00", close: "17:00" },
      }),
      taxSettings: JSON.stringify({ VAT: 20 }),
      initialCostOfBooking: "100.0",
      initialBookingLength: 60,
      bookingLengthIncrements: 15,
      maxAdvanceBookingDays: 180,
      minTimeBetweenBookings: 15,
      bufferTimeInMinutes: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Resource details
    const resourceId = uuidv4();
    await db.insert(resources).values({
      id: resourceId,
      locationId,
      type: "VR Booth",
      name: "VR Booth 1",
      status: "Available",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Bookings details
    const bookingTimes = [4, 6]; // hours later
    for (const hoursLater of bookingTimes) {
      const startTime = new Date(
        new Date().getTime() + hoursLater * 60 * 60 * 1000,
      );
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
      const bookingId = uuidv4();

      await db.insert(bookings).values({
        id: bookingId,
        locationId: locationId,
        customerName: "Customer Name",
        customerEmail: "customer@example.com",
        customerPhone: "123-456-7890",
        startTime: startTime, // toISOString() broke this ?
        endTime: endTime, // toISOString() broke this ?
        // totalCost: "200.00",
        // taxAmount: "40.00",
        // status: "Confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(resourceBookings).values({
        id: uuidv4(),
        bookingId: bookingId,
        resourceId: resourceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log("Database seeding finished");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function resetAndSeedDatabase() {
  await wipeTables(); // Ensure wipeTables completes before proceeding
  await seedDatabase(); // Proceed to seed the database
}

resetAndSeedDatabase().catch(console.error);
