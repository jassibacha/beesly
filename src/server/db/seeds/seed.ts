import { db } from "../index";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";
import {
  bookings,
  locationSettings,
  locations,
  resourceBookings,
  resources,
  users,
} from "../schema";
import { faker } from "@faker-js/faker";
import { colors } from "@/lib/utils";
import {
  ownerId,
  secondOwnerId,
  location1Id,
  location2Id,
  resource1Id,
  resource2Id,
  user1,
  user2,
  location1,
  location2,
  settings,
} from "./seedUtils";

// Seeding tsx instructions
// https://discord.com/channels/966627436387266600/1200193597870448780/1200222130093162496
// Make a gist

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

async function seedDatabase() {
  try {
    const now = DateTime.now().toUTC().toJSDate();
    const nowPST = DateTime.now().setZone("America/Los_Angeles").toJSDate();
    const nowEST = DateTime.now().setZone("America/New_York").toJSDate();

    // User details
    await db.insert(users).values(user1);
    await db.insert(users).values(user2);

    // Location 1 details
    //const location1Id = uuidv4();
    await db.insert(locations).values({
      ...location1,
      ownerId: ownerId,
      id: location1Id,
      createdAt: nowPST,
      updatedAt: nowPST,
    });
    // Location 2 details
    //const location2Id = uuidv4();
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
    //const resource1Id = uuidv4();
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
    //const resource2Id = uuidv4();
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
    const locationsArr = [
      {
        id: location1Id,
        timezone: "America/Los_Angeles",
        resourceId: resource1Id,
      },
      {
        id: location2Id,
        timezone: "America/New_York",
        resourceId: resource2Id,
      },
    ];

    for (const location of locationsArr) {
      for (let day = 0; day < daysToSeed; day++) {
        const bookingsToday = faker.number.int({
          min: minBookingsPerDay,
          max: maxBookingsPerDay,
        });

        const firstBookingHour = faker.number.int({ min: 9, max: 11 });
        let lastEndTime: DateTime = DateTime.now()
          .setZone(location.timezone)
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
            locationId: location.id,
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
            resourceId: location.resourceId,
            createdAt: now,
            updatedAt: now,
          });
        }
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
