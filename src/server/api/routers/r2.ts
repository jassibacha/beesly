import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { locations } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const r2Router = createTRPCRouter({
  getLogoUploadUrl: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        extension: z.enum(["png", "jpg"]),
      }),
    )
    .query(async ({ input, ctx }) => {
      const location = await ctx.db.query.locations.findFirst({
        where: (locations, { eq }) => eq(locations.id, input.locationId),
      });
      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }
      const slug = location.slug;
      const fileName = `${slug}/logo-${Date.now()}.${input.extension}`;
      //const fileName = `logos/${input.locationId}/logo-${Date.now()}.${input.extension}`;
      const contentType =
        input.extension === "png" ? "image/png" : "image/jpeg";

      console.log(
        "Bucket name:",
        process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME,
      );
      console.log("Account ID:", process.env.CLOUDFLARE_R2_ACCOUNT_ID);
      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

      console.log("Signed URL:", signedUrl);

      return { url: signedUrl, fileName };
    }),

  deleteLogo: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        locationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Extract the key from the image URL
      const key = input.imageUrl.replace(
        `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL}`,
        "",
      );

      const command = new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
      });

      try {
        await r2.send(command);
        console.log("Logo deleted successfully");

        // Update the logo field in the locations table
        await ctx.db
          .update(locations)
          .set({ logo: null })
          .where(eq(locations.id, input.locationId));

        return { success: true, message: "Logo deleted successfully" };
      } catch (error) {
        console.error("Error deleting logo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete logo",
        });
      }
    }),

  // deleteImage: protectedProcedure
  //   .input(z.object({ imageUrl: z.string().url() }))
  //   .mutation(async ({ input }) => {
  //     // Extract the key from the image URL
  //     const key = input.imageUrl.replace(
  //       `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL}`,
  //       "",
  //     );

  //     const command = new DeleteObjectCommand({
  //       Bucket: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME,
  //       Key: key,
  //     });

  //     try {
  //       await r2.send(command);
  //       console.log("Image deleted successfully");
  //       return { success: true, message: "Image deleted successfully" };
  //     } catch (error) {
  //       console.error("Error deleting image:", error);
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Failed to delete image",
  //       });
  //     }
  //   }),
});
