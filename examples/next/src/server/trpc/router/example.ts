import { z } from "zod";

import { router, rateLimitedProcedure } from "../trpc";

export const exampleRouter = router({
  hello: rateLimitedProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
});
