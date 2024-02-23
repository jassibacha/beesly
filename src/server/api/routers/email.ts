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
import { bookingSchema } from "@/lib/schemas/bookingSchemas";
import {
  locationSchema,
  locationSettingsSchema,
} from "@/lib/schemas/locationSchemas";
import { DateTime } from "luxon";
//import { api } from "@/trpc/server";

const sendEmailSchema = z.object({
  // to: z.string().email(),
  // from: z.string().email(),
  //subject: z.string(),
  text: z.string(),
  templateId: z.string(),
  dynamicData: z.record(z.any()),
});

const sendBookingEmailSchema = z.object({
  templateType: z.nativeEnum(EmailTemplateType),
  booking: bookingSchema,
  location: locationSchema,
  locationSettings: locationSettingsSchema,
});

export const emailRouter = createTRPCRouter({
  sendBookingEmail: publicProcedure
    .input(sendBookingEmailSchema)
    .mutation(async ({ input }) => {
      const { templateType, booking, location, locationSettings } = input;

      // Build the dynamic data based on the template type, booking, location, and location settings
      const email = buildBookingEmail(
        templateType,
        booking,
        location,
        locationSettings,
      );

      try {
        await sendEmail(email.text, email.templateId, email.dynamicData);
        return { success: true, message: "Email sent successfully" };
      } catch (error) {
        console.error("Failed to send booking email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send booking email",
        });
      }
    }),
  // Add a new procedure for sending an email
  sendEmail: publicProcedure
    .input(sendEmailSchema)
    .mutation(async ({ input }) => {
      const { text, templateId, dynamicData } = input;
      try {
        await sendEmail(
          // to,
          // from,
          text,
          templateId,
          dynamicData as DynamicEmailData,
        ); // Adjust the from email accordingly
        return { success: true, message: "Email sent successfully" };
      } catch (error) {
        console.error("Failed to send email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email",
        });
      }
    }),
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
  let textBody = "";
  let heading = "";
  let preheader = "";
  let templateId = "d-bef6d1c8eb924c238bfb75195cb8705c"; // Default template

  // Get the date and time in the location's timezone
  const tz = locationSettings.timeZone;
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
      subject = `Booking Confirmation - ${date}`;
      preheader = `We'll see you at ${startTime} ${date}.`;
      textBody = `Dear ${booking.customerName}, your booking for ${date} at ${startTime} has been confirmed.`;
      heading = "Booking Confirmed!";
      templateId = "d-bef6d1c8eb924c238bfb75195cb8705c";
      break;
    case EmailTemplateType.BookingUpdate:
      subject = `Booking Updated - ${date}`;
      preheader = `Your booking on ${date} has been updated.`;
      textBody = `Dear ${booking.customerName}, your booking for ${date} at ${startTime} has been updated.`;
      heading = "Booking Updated";
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
