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
    console.error(`Email failed to send to ${toEmail} [SG]`, error);
  }
};
