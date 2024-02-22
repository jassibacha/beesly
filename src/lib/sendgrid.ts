import sgMail from "@sendgrid/mail";
import type { DynamicEmailData } from "@/types/emailTypes";

export const sendEmail = async (
  // to: string,
  // from: string,
  text: string,
  templateId: string,
  dynamicData: DynamicEmailData,
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

  const { toEmail, toName, fromEmail, fromName, replyEmail, replyName } =
    dynamicData;

  const msg = {
    to: {
      email: toEmail,
      name: toName,
    },
    from: {
      email: fromEmail,
      name: fromName,
    },
    replyTo: {
      email: replyEmail,
      name: replyName,
    },
    //subject,
    content: [
      {
        type: "text/html",
        value: text,
      },
    ],
    templateId, // Specify the dynamic template ID
    dynamic_template_data: dynamicData, // Pass dynamic data for the template
    mailSettings: {
      bypassListManagement: {
        enable: true,
      },
      footer: {
        enable: false,
      },
      sandboxMode: {
        enable: false, // TODO: Disable sandbox mode in production
      },
    },
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${toEmail}`);
  } catch (error) {
    console.error(error);
  }
};

// IDEA FOR MODULAR EMAIL TEMPLATE GENERATION

// function xxx(bookingId / bookingObj, template) {
//   // retrieve booking or pass it in as obj
//   // generate dynamic data object based on booking (using the info in booking)

//   // values = bookingObj
//   //

//   // switch or if/else statement to determine which template to use and then pull in the necessary booking, location, locationSettings and create the dynamicData that we need to send out.

//   const dynamicData = {
//     fromEmail: "book@jassibacha.com",
//     fromName: "Book Test",
//     replyEmail: "book@beesly.io",
//     replyName: "Beesly",
//     subject: `Booking Confirmation - ${DateTime.fromJSDate(values.date).toFormat("DDDD")}`,
//     preheader: `${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} confirmed!`,
//     heading: "Booking Confirmed!",
//     textBody: `Dear ${values.customerName}, your booking for ${DateTime.fromJSDate(values.date).toFormat("DDDD")} at ${DateTime.fromISO(values.timeSlot).toFormat("h:mm a")} has been confirmed.`,
//     date: DateTime.fromJSDate(values.date).toFormat("DDDD"),
//     startTime: DateTime.fromISO(values.timeSlot)
//       .setZone(locationSettings.timeZone)
//       .toFormat("h:mm a"),
//     endTime: DateTime.fromISO(values.timeSlot)
//       .plus({ minutes: parseFloat(values.duration) * 60 })
//       .setZone(locationSettings.timeZone)
//       .toFormat("h:mm a"),
//     customerName: values.customerName,
//     customerEmail: values.customerEmail,
//     customerPhone: values.customerPhone,
//     locationName: location.name,
//     locationPhone: location.phone,
//     locationEmail: location.email,
//     locationLogo: location.logo,
//   },

// }
