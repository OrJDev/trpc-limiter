import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createTRPCNextLimiter } from "@trpc-limiter/next";

import { type Context } from "./context";

const root = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const rateLimiter = createTRPCNextLimiter({
  // @ts-expect-error something is wrong with the types when using custom data, like context.
  root,
  windowMs: 10000,
  message: "Too many requests, please try again later.",
  max: 15,
});

export const router = root.router;

export const publicProcedure = root.procedure;

export const rateLimitedProcedure = publicProcedure.use(rateLimiter);
