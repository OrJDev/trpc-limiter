# tRPC Limiter

An open source, tRPC rate limiter middleware inspired by [express-rate-limiter](https://github.com/express-rate-limit/express-rate-limit).

## Supported Frameworks

- [NextJS](https://nextjs.org/) - [Docs](https://github.com/OrJDev/trpc-limiter/tree/main/packages/next)
- [SolidStart](https://start.solidjs.com) - [Docs](https://github.com/OrJDev/trpc-limiter/tree/main/packages/solid)
- [Custom Framework](https://github.com/OrJDev/trpc-limiter/tree/main/packages/core)

## Development

This is pretty much ready to be used, I think the type safety could be improved because right now we just hope that the context includes `req` and `res` - so you can use it but just make sure you provide request and response in the tRPC context.

This project was created because of this tRPC [issue](https://github.com/trpc/trpc/issues/3227) opened by the creator of tRPC.
