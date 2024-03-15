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
import { colors } from "@/lib/utils";

// Seeding tsx instructions
// https://discord.com/channels/966627436387266600/1200193597870448780/1200222130093162496
// Make a gist

// Grab the userId from the env file to link the seed data correctly
const ownerId = process.env.OWNER_ID ?? "user_test_asx79aSjsx7U";
const secondOwnerId = "user_2dhWGn0tHmypX1jC7jA2eFHMLdt"; // Second throwaway clerk user for testing

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
    console.log(colors.magenta + "Tables wiped successfully" + colors.reset);
  } catch (error) {
    console.error(colors.red + "Error wiping tables:" + colors.reset);
    console.error(error);
  }
}

const user1 = {
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
  createdAt: DateTime.now().setZone("America/Los_Angeles").toJSDate(),
  updatedAt: DateTime.now().setZone("America/Los_Angeles").toJSDate(),
};
const user2 = {
  id: secondOwnerId,
  email: "jassi@sugoii.co",
  username: "randy",
  displayName: "Randy Marsh",
  userImage: "https://example.com/user_image.jpg",
  onboarded: true,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
  createdAt: DateTime.now().setZone("America/New_York").toJSDate(),
  updatedAt: DateTime.now().setZone("America/New_York").toJSDate(),
};
const location1 = {
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
};
const location2 = {
  name: "Escape Virtual",
  slug: "escape",
  type: "VR Arcade",
  phone: "212-300-0075",
  email: "hello@escapevirtual.io",
  website: "https://www.escapevirtual.io",
  streetAddress: "130 W 29th St",
  city: "New York",
  state: "New York",
  zipCode: "10001",
  country: "USA",
  timezone: "America/New_York",
  logo: "https://pub-a8bff496fa524be3b69903c9c9aeb879.r2.dev/escape/logo-1710470513529.png",
};
const settings = {
  dailyAvailability: JSON.stringify({
    Monday: { open: "09:00", close: "23:00", isOpen: true },
    Tuesday: { open: "09:00", close: "23:00", isOpen: true },
    Wednesday: { open: "09:00", close: "23:00", isOpen: true },
    Thursday: { open: "09:00", close: "23:00", isOpen: true },
    Friday: { open: "09:00", close: "23:00", isOpen: true },
    Saturday: { open: "09:00", close: "23:00", isOpen: true },
    Sunday: { open: "09:00", close: "23:00", isOpen: true },
  }),
  taxSettings: "12.50",
  //taxSettings: JSON.stringify({ VAT: 20 }),
  initialCostOfBooking: "100.0",
  initialBookingLength: 60,
  bookingLengthIncrements: 30,
  maxAdvanceBookingDays: 30,
  sameDayLeadTimeBuffer: 120,
  //minTimeBetweenBookings: 15,
  bufferTime: 10,
  timeSlotIncrements: 15,
  displayUnavailableSlots: false,
};

async function seedDatabase() {
  try {
    const now = DateTime.now().toUTC().toJSDate();
    const nowPST = DateTime.now().setZone("America/Los_Angeles").toJSDate();
    const nowEST = DateTime.now().setZone("America/New_York").toJSDate();

    // User details
    await db.insert(users).values(user1);
    await db.insert(users).values(user2);

    // Location 1 details
    const location1Id = uuidv4();
    await db.insert(locations).values({
      ...location1,
      ownerId: ownerId,
      id: location1Id,
      createdAt: nowPST,
      updatedAt: nowPST,
    });
    // Location 2 details
    const location2Id = uuidv4();
    await db.insert(locations).values({
      ...location2,
      ownerId: secondOwnerId,
      id: location2Id,
      createdAt: nowEST,
      updatedAt: nowEST,
    });

    // Location 1 Settings details
    await db.insert(locationSettings).values({
      ...settings,
      id: uuidv4(),
      locationId: location1Id,
      createdAt: nowPST,
      updatedAt: nowPST,
    });
    // Location 2 Settings details
    await db.insert(locationSettings).values({
      ...settings,
      id: uuidv4(),
      locationId: location2Id,
      createdAt: nowEST,
      updatedAt: nowEST,
    });

    // Resource 1 details
    const resource1Id = uuidv4();
    await db.insert(resources).values({
      id: resource1Id,
      locationId: location1Id,
      type: "VR Booth",
      name: "Station 1",
      status: "Available",
      createdAt: nowPST,
      updatedAt: nowPST,
    });
    // Resource 2 details
    const resource2Id = uuidv4();
    await db.insert(resources).values({
      id: resource2Id,
      locationId: location2Id,
      type: "VR Booth",
      name: "Booth 1",
      status: "Available",
      createdAt: nowEST,
      updatedAt: nowEST,
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
          locationId: location1Id,
          customerName: faker.person.fullName(),
          //customerEmail: faker.internet.email(),
          customerEmail: "admin@jassibacha.com",
          customerPhone: faker.phone.number(),
          startTime: startTime,
          endTime: endTime,
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        });

        await db.insert(resourceBookings).values({
          id: uuidv4(),
          bookingId: bookingId,
          resourceId: resource1Id,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    console.log(colors.green + "Database seeding finished" + colors.reset);
  } catch (error) {
    console.error(colors.red + "Error seeding database:" + colors.reset);
    console.error(error);
  }
}

async function resetAndSeedDatabase() {
  await wipeTables(); // Ensure wipeTables completes before proceeding
  await seedDatabase(); // Proceed to seed the database
}

resetAndSeedDatabase().catch(console.error);
