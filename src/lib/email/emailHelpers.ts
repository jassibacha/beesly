import { sendEmail } from "./sendgrid";
import type { Booking, Location, LocationSetting } from "@/server/db/types";
//import { api } from "@/trpc/server";
import { EmailTemplateType } from "@/types/emailTypes";
import { api } from "@/trpc/react";
import { DateTime } from "luxon";

export async function sendBookingEmail(
  templateType: EmailTemplateType,
  booking: Booking,
  location: Location,
  locationSettings: LocationSetting,
  //mutate: (data: any) => Promise<any>,
) {
  const sendEmailMutation = api.email.sendEmail.useMutation();

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

  // try {
  //   await mutate({
  //     text: textBody,
  //     templateId: templateId,
  //     dynamicData: dynamicData,
  //   });
  //   console.log(`Email sent to ${booking.customerEmail}`);
  // } catch (error) {
  //   console.error(`Failed to send email to ${booking.customerEmail}`, error);
  // }

  sendEmailMutation.mutate(
    {
      text: textBody,
      templateId: templateId,
      dynamicData: dynamicData,
    },
    {
      onSuccess: () => {
        console.log(`Email sent to ${booking.customerEmail}`);
      },
      onError: (error) => {
        console.error(
          `Failed to send email to ${booking.customerEmail} [SBE]`,
          error,
        );
      },
    },
  );

  // try {
  //   // await api.email.sendEmail.mutate({
  //   //   text: textBody,
  //   //   templateId: templateId,
  //   //   dynamicData: dynamicData,
  //   // });
  //   console.log(`Email sent to ${booking.customerEmail}`);
  // } catch (error) {
  //   console.error(`Failed to send email to ${booking.customerEmail}`, error);
  // }

  // Server side trpc, oops
  // await api.email.sendEmail
  //   .mutate({
  //     text: textBody,
  //     templateId: templateId,
  //     dynamicData: dynamicData,
  //   })
  //   .catch((error) => {
  //     console.error(
  //       `Failed to send email to ${booking.customerEmail} [SBE]`,
  //       error,
  //     );
  //   });
}
