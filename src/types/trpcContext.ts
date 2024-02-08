import type { inferAsyncReturnType } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";

export type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;
