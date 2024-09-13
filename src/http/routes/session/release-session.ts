import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { prisma } from "@/lib/prisma"

export async function releaseSession(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/sessions/:sessionId/release",
    {
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.params

      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          _count: {
            select: {
              goals: true,
            },
          },
        },
      })

      if (!session) {
        throw new ClientError("Session not found")
      }

      if (session.releasedAt !== null) {
        throw new ClientError("This session has already been released")
      }

      if (session._count.goals < 3) {
        throw new ClientError("Session need to have at least three goals")
      }

      await prisma.session.update({
        where: {
          id: sessionId,
        },
        data: {
          releasedAt: new Date(),
        },
      })

      reply.status(204)
    },
  )
}
