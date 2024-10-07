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
          201: z.object({
            panelId: z.string().uuid(),
          }),
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

      const panel = await prisma.$transaction(async transaction => {
        await transaction.session.update({
          where: {
            id: sessionId,
          },
          data: {
            releasedAt: new Date(),
          },
        })

        const panel = await transaction.panel.create({
          data: {
            sessionId,
          },
        })

        return panel
      })

      return reply.status(201).send({ panelId: panel.id })
    },
  )
}
