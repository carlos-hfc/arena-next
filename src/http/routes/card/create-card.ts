import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function createCard(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
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

        await request.getCurrentUserId()

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
