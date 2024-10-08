import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"

export async function createPanel(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/:sessionId/panels",
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
          panel: true,
        },
      })

      if (!session) {
        throw new ClientError("Session not found")
      }

      if (session.releasedAt === null) {
        throw new ClientError("Unreleased sessions cannot be on panels")
      }

      if (session.panel !== null) {
        throw new ClientError("This session already has a panel")
      }

      const panel = await prisma.panel.create({
        data: {
          sessionId,
        },
      })

      return reply.status(201).send({ panelId: panel.id })
    },
  )
}
