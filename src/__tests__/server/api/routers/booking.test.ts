// import { createCallerFactory, type inferProcedureInput } from "@trpc/server";
// import { describe, expect, test, vi } from "vitest";

// import { db } from "@/server/db";

// import { appRouter, type AppRouter } from "@/server/api/root";
// import { createTRPCContext } from "@/server/api/trpc";
// import type { AuthObjectWithDeprecatedResources } from "node_modules/@clerk/nextjs/dist/types/server/types";
// import type {
//   SignedInAuthObject,
//   SignedOutAuthObject,
// } from "@clerk/nextjs/server";

// describe("Location router", () => {
//   test("book route", async () => {
//     // vi.mock("@clerk/nextjs", () => {
//     //   return {
//     //     auth: () => new Promise((resolve) => resolve({ userId: "test-user" })),
//     //     // ClerkProvider: ({ children }) => <div>{children}</div>,
//     //     // useUser: () => ({
//     //     //   isSignedIn: true,
//     //     //   user: {
//     //     //     id: 'user_8JkL2mP0zX6d8JkL2mP0zX6dJ',
//     //     //     fullName: 'Thrall Durotan',
//     //     //   },
//     //     // }),
//     //   };
//     // });

//     const authObject: SignedOutAuthObject = {
//       sessionClaims: null,
//       sessionId: null,
//       session: null,
//       actor: null,
//       userId: null,
//       user: null,
//       orgId: null,
//       orgRole: null,
//       orgSlug: null,
//       orgPermissions: null,
//       organization: null,
//       // getToken: ServerGetToken,
//       // has: CheckAuthorizationWithCustomPermissions;
//       // debug: AuthObjectDebug;
//     };

//     const ctx = await createTRPCContext({
//       headers: new Headers(),
//       auth: authObject,
//       //db,
//     });
//     //const ctx = await createContextInner({});
//     const caller = appRouter.createCaller(ctx);

//     type Input = inferProcedureInput<AppRouter["location"]["getLocationById"]>;
//     const input: Input = {
//       id: "1",
//     };

//     const location = await caller.location.getLocationById(input);

//     expect(location).toMatchObject({ greeting: "Hello test" });
//   });
// });
