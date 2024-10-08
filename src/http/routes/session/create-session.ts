import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { prisma } from "../../../lib/prisma"

export async function createSession(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
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

      const session = await prisma.session.create({
        data: {
          name,
          teams: {
            createMany: {
              data: Array.from({ length: 3 }).map((_, i) => {
                return {
                  name: `Equipe ${i + 1}`,
                }
              }),
            },
          },
        },
      })

      return reply.status(201).send({ sessionId: session.id })
    },
  )
}
