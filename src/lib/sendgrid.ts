import sgMail from "@sendgrid/mail";
import type { DynamicEmailData } from "@/types/emailTypes";

export const sendEmail = async (
  to: string,
  from: string,
  text: string,
  templateId: string,
  dynamicData: DynamicEmailData,
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

  //const { fromEmail, fromName, replyEmail, replyName, ...otherDynamicData } =
  dynamicData;

  const msg = {
    to,
    from: {
      email: from,
      name: dynamicData.locationName,
    },
    replyTo: {
      email: dynamicData.replyEmail,
      name: dynamicData.replyName,
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
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(error);
  }
};
