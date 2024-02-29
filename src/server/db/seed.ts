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
import { faker } from "@faker-js/faker";

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
    //const now = DateTime.now().toUTC().toJSDate();
    const now = DateTime.now().setZone("America/Los_Angeles").toJSDate();

    // User details
    await db.insert(users).values({
      id: ownerId,
      email: "klikster@gmail.com",
      username: "ownerUsername",
      displayName: "J B",
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
      name: "Evolve Virtual Reality",
      slug: "evolve",
      type: "VR Arcade",
      phone: "236-772-9873",
      email: "email@evolvevr.ca",
      website: "https://www.evolvevr.ca",
      streetAddress: "411 W Broadway",
      city: "Vancouver",
      state: "BC",
      zipCode: "V5Y 1R4",
      country: "Canada",
      timezone: "America/Los_Angeles",
      logo: "https://pub-a8bff496fa524be3b69903c9c9aeb879.r2.dev/evolve/logo-1708473130465.png",
      createdAt: now,
      updatedAt: now,
    });

    // Location Settings details
    await db.insert(locationSettings).values({
      id: uuidv4(),
      locationId,
      dailyAvailability: JSON.stringify({
        Monday: { open: "09:00", close: "22:00", isOpen: true },
        Tuesday: { open: "09:00", close: "22:00", isOpen: true },
        Wednesday: { open: "09:00", close: "22:00", isOpen: true },
        Thursday: { open: "09:00", close: "22:00", isOpen: true },
        Friday: { open: "09:00", close: "23:00", isOpen: true },
        Saturday: { open: "09:00", close: "23:00", isOpen: true },
        Sunday: { open: "09:00", close: "22:00", isOpen: true },
      }),
      taxSettings: JSON.stringify({ VAT: 20 }),
      initialCostOfBooking: "100.0",
      initialBookingLength: 60,
      bookingLengthIncrements: 30,
      maxAdvanceBookingDays: 30,
      sameDayLeadTimeBuffer: 120,
      //minTimeBetweenBookings: 15,
      bufferTime: 10,
      timeSlotIncrements: 15,
      displayUnavailableSlots: false,
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
    const daysToSeed = 5; // Number of days to seed bookings for
    const minBookingsPerDay = 5;
    const maxBookingsPerDay = 7;

    for (let day = 0; day < daysToSeed; day++) {
      const bookingsToday = faker.number.int({
        min: minBookingsPerDay,
        max: maxBookingsPerDay,
      });

      const firstBookingHour = faker.number.int({ min: 9, max: 11 });
      let lastEndTime: DateTime = DateTime.now()
        .plus({ days: day + 1 })
        .set({ hour: firstBookingHour, minute: 0 });

      for (let i = 0; i < bookingsToday; i++) {
        // Randomly choose between a 15-minute or 30-minute gap after the last end time
        const gap = faker.number.int({ min: 1, max: 2 }) * 15;
        const startTime = roundToNearest15(
          lastEndTime.plus({ minutes: gap }),
        ).toJSDate();

        const durationOptions = [1, 1.5, 2];
        const duration =
          durationOptions[
            faker.number.int({ min: 0, max: durationOptions.length - 1 })
          ];

        const endTime = roundToNearest15(
          DateTime.fromJSDate(startTime).plus({ hours: duration }),
        ).toJSDate();

        // Update last end time to the end time of the new booking
        lastEndTime = DateTime.fromJSDate(endTime);

        const bookingId = uuidv4();

        await db.insert(bookings).values({
          id: bookingId,
          locationId: locationId,
          customerName: faker.person.fullName(),
          customerEmail: faker.internet.email(),
          customerPhone: faker.phone.number(),
          startTime: startTime,
          endTime: endTime,
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
