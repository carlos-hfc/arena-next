import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { prisma } from "@/lib/prisma"

export async function updateSession(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/sessions/:sessionId",
    {
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(4),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.params
      const { name } = request.body

      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      })

      if (!session) {
        throw new ClientError("Session not found")
      }

      if (session.releasedAt) {
        throw new ClientError("Released sessions cannot be updated")
      }

      await prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          name,
        },
      })

      reply.status(204)
    },
  )
}
