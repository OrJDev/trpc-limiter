import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createTRPCLimiter } from "@trpc-limiter/core";
import { type Context } from "./context";
import { type NextApiRequest } from "next";

const root = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const getFingerPrint = (req: NextApiRequest) => {
  const ip = req.socket.remoteAddress ?? req.headers["x-forwarded-for"];
  return (Array.isArray(ip) ? ip[0] : ip) ?? "127.0.0.1";
};
export const rateLimiter = createTRPCLimiter({
  root,
  fingerprint: (ctx) => getFingerPrint(ctx.req),
  windowMs: 10000,
  message: "Too many requests, please try again later.",
  max: 15,
});

export const router = root.router;

export const publicProcedure = root.procedure;

export const rateLimitedProcedure = publicProcedure.use(rateLimiter);
