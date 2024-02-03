import { db } from "./index";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
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

// Function to round DateTime to the nearest 15 minutes, breaks the JSDate() we try to return
function roundToNearest15(dateTime: DateTime): DateTime {
  const minutes = dateTime.minute;
  const remainder = minutes % 15;
  const minutesToAdd = remainder < 8 ? -remainder : 15 - remainder;
  return dateTime.plus({ minutes: minutesToAdd }).startOf("minute");
}

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
    const now = DateTime.now().toUTC().toJSDate();
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
      createdAt: now,
      updatedAt: now,
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
      createdAt: now,
      updatedAt: now,
    });

    // Location Settings details
    await db.insert(locationSettings).values({
      id: uuidv4(),
      locationId,
      timeZone: "America/Los_Angeles",
      dailyAvailability: JSON.stringify({
        1: { open: "09:00", close: "22:00" },
        2: { open: "09:00", close: "22:00" },
        3: { open: "09:00", close: "22:00" },
        4: { open: "09:00", close: "22:00" },
        5: { open: "09:00", close: "23:00" },
        6: { open: "09:00", close: "23:00" },
        7: { open: "09:00", close: "22:00" },
      }),
      taxSettings: JSON.stringify({ VAT: 20 }),
      initialCostOfBooking: "100.0",
      initialBookingLength: 60,
      bookingLengthIncrements: 15,
      maxAdvanceBookingDays: 180,
      minTimeBetweenBookings: 15,
      bufferTimeInMinutes: 10,
      createdAt: now,
      updatedAt: now,
    });

    // Resource details
    const resourceId = uuidv4();
    await db.insert(resources).values({
      id: resourceId,
      locationId,
      type: "VR Booth",
      name: "Station 1",
      status: "Available",
      createdAt: now,
      updatedAt: now,
    });

    // Bookings details
    const bookingTimes = [4, 7, 9]; // hours later
    for (const hoursLater of bookingTimes) {
      // Calculate start and end times using Luxon, rounded to the nearest
      // 15 minutes and ensuring seconds are at 00
      const nowPlusHours = DateTime.now()
        .setZone("utc")
        .plus({ hours: hoursLater });
      const roundedStartTime = nowPlusHours
        .plus({ minutes: (15 - (nowPlusHours.minute % 15)) % 15 })
        .startOf("minute");
      const startTime = roundedStartTime.toJSDate();
      const endTime = roundedStartTime
        .plus({ hours: 2 })
        .startOf("minute")
        .toJSDate();

      // THIS WORKS FINE, NO ERRORS WITH BOOKINGS INSERT
      // const startTime = DateTime.now()
      //   .plus({ hours: hoursLater })
      //   .toUTC()
      //   .toJSDate();
      // const endTime = DateTime.now()
      //   .plus({ hours: hoursLater + 2 })
      //   .toUTC()
      //   .toJSDate();

      // const startTime = new Date(
      //   new Date().getTime() + hoursLater * 60 * 60 * 1000,
      // );
      // const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
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
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(resourceBookings).values({
        id: uuidv4(),
        bookingId: bookingId,
        resourceId: resourceId,
        createdAt: now,
        updatedAt: now,
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