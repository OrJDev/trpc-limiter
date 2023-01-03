import { root } from '../utils'
import exampleRouter from './example'

export const appRouter = root.mergeRouters(exampleRouter)

export type IAppRouter = typeof appRouter
