import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { prisma } from "../../../lib/prisma"

export async function getSessions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/sessions",
    {
      schema: {
        response: {
          200: z.object({
            sessions: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                releasedAt: z.date().nullable(),
              }),
            ),
          }),
        },
      },
    },
    async () => {
      const sessions = await prisma.session.findMany()

      return { sessions }
    },
  )
}
