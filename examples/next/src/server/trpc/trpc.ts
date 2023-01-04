import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { createTRPCUpstashLimiter } from "@trpc-limiter/upstash";
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
export const rateLimiter = createTRPCUpstashLimiter({
  root,
  fingerprint: (ctx) => getFingerPrint(ctx.req),
  windowMs: 20000,
  message: (retryAfter) =>
    `Too many requests, please try again later. ${retryAfter}`,
  max: 5,
});

export const router = root.router;

export const publicProcedure = root.procedure;

export const rateLimitedProcedure = publicProcedure.use(rateLimiter);
