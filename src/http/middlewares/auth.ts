import fastifyPlugin from "fastify-plugin"

import { ClientError } from "@/errors/client-error"

interface GetCurrentUserParams {
  optional?: boolean
}

export const auth = fastifyPlugin(async app => {
  app.addHook("preHandler", async request => {
    request.getCurrentUserId = async ({
      optional,
    }: GetCurrentUserParams = {}) => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        if (!optional) {
          throw new ClientError("Invalid auth token")
        }
      }
    }
  })
})
