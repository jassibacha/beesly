import sgMail from "@sendgrid/mail";

export const sendEmail = async (
  to: string,
  from: string,
  subject: string,
  text: string,
  templateId: string,
  dynamicData: object,
) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

  const msg = {
    to,
    from,
    subject,
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
        enable: false,
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
