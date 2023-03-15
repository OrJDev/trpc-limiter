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

const getFingerprint = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"]
  const ip = forwarded
    ? (typeof forwarded === "string" ? forwarded : forwarded[0])?.split(/, /)[0]
    : req.socket.remoteAddress
  return ip || "127.0.0.1"
}

export const rateLimiter = createTRPCUpstashLimiter({
  root,
  fingerprint: (ctx) => getFingerprint(ctx.req),
  windowMs: 20000,
  message: (hitInfo) =>
    `Too many requests, please try again later. ${Math.ceil(
      (hitInfo.reset - Date.now()) / 1000
    )}`,
  onLimit: (hitInfo) => {
    console.log(hitInfo);
  },
  max: 5,
});

export const router = root.router;

export const publicProcedure = root.procedure;

export const rateLimitedProcedure = publicProcedure.use(rateLimiter);
