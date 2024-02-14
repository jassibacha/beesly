import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { z } from "zod";

export const uploadRouter = createTRPCRouter({
  getUploadUrl: publicProcedure
    .input(
      z.object({
        locationId: z.string(),
        extension: z.enum(["png", "jpg"]),
      }),
    )
    .query(async ({ input }) => {
      const fileName = `logos/${input.locationId}/logo-${Date.now()}.${input.extension}`;
      const contentType =
        input.extension === "png" ? "image/png" : "image/jpeg";

      console.log("Bucket name:", process.env.CLOUDFLARE_R2_BUCKET_NAME);
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

      return { url: signedUrl, fileName };
    }),
});
