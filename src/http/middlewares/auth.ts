import fastifyPlugin from "fastify-plugin"

import { ClientError } from "../../errors/client-error"

export const auth = fastifyPlugin(async app => {
  app.addHook("preHandler", async request => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        throw new ClientError("Invalid auth token")
      }
    }
  })
})
