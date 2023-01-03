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
  root,
  getReq: (ctx) => ctx.req,
  getRes: (ctx) => ctx.res,
  windowMs: 10000,
  message: "Too many requests, please try again later.",
  max: 15,
});

export const router = root.router;

export const publicProcedure = root.procedure;

export const rateLimitedProcedure = publicProcedure.use(rateLimiter);
