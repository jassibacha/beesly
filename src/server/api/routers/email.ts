import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { sendEmail } from "@/lib/sendgrid";

import {
  createLocationSchema,
  locationSettingsSchema,
} from "@/lib/schemas/locationSchemas";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";

const sendEmailSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string(),
  text: z.string(),
  templateId: z.string(),
  dynamicData: z.record(z.any()), // Use a more specific schema based on your needs
});

export const emailRouter = createTRPCRouter({
  // Add a new procedure for sending an email
  sendEmail: publicProcedure
    .input(sendEmailSchema)
    .mutation(async ({ input }) => {
      const { to, from, subject, text, templateId, dynamicData } = input;
      try {
        await sendEmail(to, from, subject, text, templateId, dynamicData); // Adjust the from email accordingly
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
