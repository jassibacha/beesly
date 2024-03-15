import { DateTime } from "luxon";
import { db } from "../index";
import { bookings, resourceBookings } from "../schema";
import { v4 as uuidv4 } from "uuid";
import { location1Id, location2Id, resource1Id, resource2Id } from "./seed";
import { faker } from "@faker-js/faker";
import { colors } from "@/lib/utils";

async function generateTestBookings() {
  const now = DateTime.now().setZone("UTC");
  const locationResourceMap = {
    [location1Id]: resource1Id,
    [location2Id]: resource2Id,
  };

  for (const [locationId, resourceId] of Object.entries(locationResourceMap)) {
    // Retrieve the location details from the database
    const location = await db.query.locations.findFirst({
      where: (locations, { eq }) => eq(locations.id, locationId),
    });

    // If the location is not found, log an error message and skip to the next iteration
    if (!location) {
      console.error(`Location with ID ${locationId} not found`);
      continue;
    }

    // Extract the timezone of the location
    const timezone = location.timezone;
    // Calculate the base start time 24 hours ahead, rounded to the nearest half-hour
    const baseStartTime = now.plus({
      days: 1,
      minutes: 30 - (now.minute % 30),
    });
    // Create an array of start times at 15-minute intervals from the base start time
    const startTimes = [
      baseStartTime,
      baseStartTime.plus({ minutes: 15 }),
      baseStartTime.plus({ minutes: 30 }),
      baseStartTime.plus({ minutes: 45 }),
    ];

    // Iterate over each start time to create bookings
    for (const startTime of startTimes) {
      // Calculate the end time by adding 15 minutes to the start time
      const endTime = startTime.plus({ minutes: 15 });
      // Generate a unique ID for the booking
      const bookingId = uuidv4();

      // Insert the booking into the database
      await db.insert(bookings).values({
        id: bookingId,
        locationId,
        customerName: faker.person.fullName(),
        //customerEmail: faker.internet.email(),
        customerEmail: "admin@jassibacha.com",
        customerPhone: faker.phone.number(),
        startTime: startTime.setZone(timezone).toJSDate(),
        endTime: endTime.setZone(timezone).toJSDate(),
        status: "ACTIVE",
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      });

      // Create a resource booking
      await db.insert(resourceBookings).values({
        id: uuidv4(),
        bookingId,
        resourceId,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      });
    }
  }

  console.log(
    colors.green + "Test bookings generated successfully" + colors.reset,
  );
}

generateTestBookings().catch(console.error);
