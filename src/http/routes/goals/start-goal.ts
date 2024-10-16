import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"

export async function startGoal(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/sessions/:sessionId/goals/:goalId",
    {
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
          goalId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { goalId, sessionId } = request.params

      const goal = await prisma.goal.findUnique({
        where: {
          id: goalId,
          sessionId,
        },
      })

      if (!goal) {
        throw new ClientError("Goal not found")
      }

      await prisma.goal.update({
        where: {
          id: goal.id,
        },
        data: {
          startedAt: new Date(),
        },
      })

      reply.status(204)
    },
  )
}
