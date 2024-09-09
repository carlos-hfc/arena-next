import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function createSession(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/sessions",
      {
        schema: {
          body: z.object({
            name: z.string().min(4),
          }),
          response: {
            201: z.object({
              sessionId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { name } = request.body

        const userId = await request.getCurrentUserId()

        const session = await prisma.session.create({
          data: {
            name,
            createdById: userId,
          },
        })

        return reply.status(201).send({ sessionId: session.id })
      },
    )
}
