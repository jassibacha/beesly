import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const testRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getTest: publicProcedure.query(async () => {
    return [1, 2, 3];
  }),
  getProtectedTest: protectedProcedure.query(async () => {
    return [4, 5, 6];
  }),
});
