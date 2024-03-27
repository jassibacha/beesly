import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { sendEmail } from "@/lib/email/sendgrid";

import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import { EmailTemplateType, type DynamicEmailData } from "@/types/emailTypes";

import type { Booking, Location, LocationSetting } from "@/server/db/types";
import { bookings } from "@/server/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { bookingSchema } from "@/lib/schemas/bookingSchemas";
import {
  locationSchema,
  locationSettingsSchema,
} from "@/lib/schemas/locationSchemas";
import { DateTime } from "luxon";
import { api } from "@/trpc/server";
//import { api } from "@/trpc/server";

// const sendEmailSchema = z.object({
//   // to: z.string().email(),
//   // from: z.string().email(),
//   //subject: z.string(),
//   text: z.string(),
//   templateId: z.string(),
//   dynamicData: z.record(z.any()),
// });

const sendBookingEmailSchema = z.object({
  templateType: z.nativeEnum(EmailTemplateType),
  booking: bookingSchema,
  location: locationSchema,
  locationSettings: locationSettingsSchema,
});

export const emailRouter = createTRPCRouter({
  // Send booking email
  sendBookingEmail: publicProcedure
    .input(sendBookingEmailSchema)
    .mutation(async ({ input }) => {
      const { templateType, booking, location, locationSettings } = input;

      console.log(
        "sendBookingEmail",
        templateType,
        booking,
        location,
        locationSettings,
      );

      // Build the dynamic data based on the template type, booking, location, and location settings
      const email = buildBookingEmail(
        templateType,
        booking as Booking,
        location as Location,
        locationSettings as LocationSetting,
      );

      try {
        await sendEmail(email.text, email.templateId, email.dynamicData);
        console.log("Email sent successfully");
        return { success: true, message: "Email sent successfully" };
      } catch (error) {
        console.error("Failed to send booking email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send booking email",
        });
      }
    }),
  // Scan and send booking reminders
  sendBookingReminders: publicProcedure.query(async ({ ctx }) => {
    const secretKey = ctx.headers.get("x-secret-key");
    if (secretKey !== process.env.EASYCRON_SECRET_KEY) {
      console.log("sendBookingReminders Error: Invalid secret key");
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid secret key",
      });
    }

    const now = DateTime.now(); // Get the current time
    const reminderTimeStart = now.plus({ days: 1 }); // Exactly 24 hours from now
    const reminderTimeEnd = reminderTimeStart.plus({ hours: 1 }); // Check the next 1 hour of bookings (30min overlap)

    // Fetch bookings that are happening within the next hour, 24 hours from now, and haven't had a reminder sent
    const bookingsToSendReminder = await ctx.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "ACTIVE"),
          gte(bookings.startTime, reminderTimeStart.toJSDate()),
          lt(bookings.startTime, reminderTimeEnd.toJSDate()),
          eq(bookings.emailReminderSent, false),
        ),
      )
      .execute();

    // console.log(
    //   "Bookings to send reminders for: ",
    //   bookingsToSendReminder.length,
    // );

    // We could do a join here to get all of the locations and locationSettings at the same time then we just have that data for each booking
    // Or we could extract the list of unique locationIds from the list of bookings,

    // Success and error counters
    let successCount = 0;
    let errorCount = 0;

    // Setup caches to avoid duplicate database calls
    const locationsCache: Record<string, Location> = {};
    const locationSettingsCache: Record<string, LocationSetting> = {};

    for (const booking of bookingsToSendReminder) {
      try {
        //console.log(`Processing booking ID: ${booking.id} [SBR]`);

        // Fetch and cache location data if not already in cache
        if (!locationsCache[booking.locationId]) {
          //console.log(`locationsCache not found for ${booking.locationId}`);
          const location = await ctx.db.query.locations.findFirst({
            where: (locations, { eq }) => eq(locations.id, booking.locationId),
          });
          if (!location) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Location not found",
            });
          }
          locationsCache[booking.locationId] = location as Location;
        }

        // Fetch and cache location settings data if not already in cache
        if (!locationSettingsCache[booking.locationId]) {
          // console.log(
          //   `locationSettingsCache not found for ${booking.locationId}`,
          // );
          const locationSettings =
            await ctx.db.query.locationSettings.findFirst({
              where: (locationSettings, { eq }) =>
                eq(locationSettings.locationId, booking.locationId),
            });
          if (!locationSettings) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Location settings not found",
            });
          }
          locationSettingsCache[booking.locationId] =
            locationSettings as LocationSetting;
        }

        // Build the booking reminder email using cached data
        const reminderEmail = buildBookingEmail(
          EmailTemplateType.BookingReminder,
          booking,
          locationsCache[booking.locationId]!,
          locationSettingsCache[booking.locationId]!,
        );

        // console.log(
        //   `Sending email reminder for booking ID: ${booking.id} [SBR]`,
        // );
        // Send the booking reminder email
        await sendEmail(
          reminderEmail.text,
          reminderEmail.templateId,
          reminderEmail.dynamicData,
        );
        // sE.catch((error) => {
        //   console.error(
        //     `Failed to send booking email for booking ID: ${booking.id} [SBR][SE]`,
        //     error,
        //   );
        // });

        // Update booking to mark emailReminderSent as true
        await ctx.db
          .update(bookings)
          .set({ emailReminderSent: true })
          .where(eq(bookings.id, booking.id))
          .execute();
        //console.log("Email reminder sent successfully [SBR]: ", booking.id);
        successCount++;
        //return { success: true, message: "Email sent successfully" };
      } catch (error) {
        console.error(
          `Failed to send booking email for booking ID: ${booking.id} [SBR]`,
          error,
        );
        errorCount++;
        // throw new TRPCError({
        //   code: "INTERNAL_SERVER_ERROR",
        //   message: "Failed to send booking email",
        // });
      }
    }

    return {
      success: errorCount === 0,
      message: `Email reminders sent. Success: ${successCount}, Failed: ${errorCount}`,
    };
  }),
  // Add a new procedure for sending an email
  // sendEmail: publicProcedure
  //   .input(sendEmailSchema)
  //   .mutation(async ({ input }) => {
  //     const { text, templateId, dynamicData } = input;
  //     try {
  //       await sendEmail(
  //         // to,
  //         // from,
  //         text,
  //         templateId,
  //         dynamicData as DynamicEmailData,
  //       ); // Adjust the from email accordingly
  //       return { success: true, message: "Email sent successfully" };
  //     } catch (error) {
  //       console.error("Failed to send email:", error);
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to send email",
  //       });
  //     }
  //   }),
});

function buildBookingEmail(
  templateType: EmailTemplateType,
  booking: Booking,
  location: Location,
  locationSettings: LocationSetting,
) {
  // Implement the logic to build the dynamic data based on the template type, booking, location, and location settings
  // Return the dynamic data object
  // Set defaults for template switches
  let subject = "";
  let preheader = "";
  let heading = "";
  let bodyHeading = "";
  let textBody = "";
  let templateId = "d-bef6d1c8eb924c238bfb75195cb8705c"; // Default template

  // Parse the dailyAvailability and taxSettings fields back into objects
  // const parsedDailyAvailability = JSON.parse(
  //   locationSettings.dailyAvailability,
  // );
  // const parsedTaxSettings = JSON.parse(locationSettings.taxSettings);

  // Get the date and time in the location's timezone
  const tz = location.timezone;
  const date = DateTime.fromJSDate(booking.startTime)
    .setZone(tz)
    .toFormat("DDDD");
  const startTime = DateTime.fromJSDate(booking.startTime)
    .setZone(tz)
    .toFormat("h:mm a");
  const endTime = DateTime.fromJSDate(booking.endTime)
    .setZone(tz)
    .toFormat("h:mm a");

  switch (templateType) {
    case EmailTemplateType.BookingConfirmation:
      subject = `Booking Confirmation - ${startTime} ${date}`;
      preheader = `We'll see you at ${startTime} ${date}.`;
      heading = "Booking Confirmed!";
      bodyHeading = "We're excited to see you!";
      textBody = `Dear ${booking.customerName}, your booking for ${date} at ${startTime} has been confirmed.`;
      templateId = "d-bef6d1c8eb924c238bfb75195cb8705c";
      break;
    case EmailTemplateType.BookingUpdate:
      subject = `Booking Updated - ${startTime} ${date}`;
      preheader = `Your booking on ${date} has been updated.`;
      heading = "Booking Updated";
      bodyHeading = "Your booking has changed.";
      textBody = `Dear ${booking.customerName}, your booking for ${date} at ${startTime} has been updated.`;
      templateId = "d-bef6d1c8eb924c238bfb75195cb8705c";
      break;
    case EmailTemplateType.BookingReminder:
      subject = `Booking Reminder - ${startTime} ${date}`;
      preheader = `Your booking on ${date} is coming up soon.`;
      heading = "Booking Reminder";
      bodyHeading = "It's almost time!";
      textBody = `Dear ${booking.customerName}, your booking for ${date} at ${startTime} is coming up soon.`;
      templateId = "d-bef6d1c8eb924c238bfb75195cb8705c";
      break;
  }

  const dynamicData = {
    toEmail: booking.customerEmail,
    toName: booking.customerName,
    fromEmail: "book@jassibacha.com",
    fromName: location.name,
    replyEmail: "book@beesly.io",
    replyName: "Beesly",
    subject,
    preheader,
    heading,
    bodyHeading,
    textBody,
    date: date,
    startTime: startTime,
    endTime: endTime,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    locationName: location.name,
    locationPhone: location.phone!,
    locationEmail: location.email!,
    locationLogo: location.logo,
  };

  return {
    text: textBody,
    templateId: templateId,
    dynamicData: dynamicData,
  };
}
