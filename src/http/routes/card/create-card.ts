import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"

export async function createCard(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/:sessionId/cards",
    {
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        body: z.object({
          description: z.string().min(6),
        }),
        response: {
          201: z.object({
            cardId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { description } = request.body
      const { sessionId } = request.params

      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
      })

      if (!session) {
        throw new ClientError("Session not found")
      }

      if (session.releasedAt === null) {
        throw new ClientError("Unreleased sessions cannot to have cards")
      }

      const card = await prisma.card.create({
        data: {
          description,
          sessionId,
        },
      })

      return reply.status(201).send({ cardId: card.id })
    },
  )
}
