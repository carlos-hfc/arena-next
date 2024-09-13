import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { prisma } from "@/lib/prisma"

export async function listTeams(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/sessions/:sessionId/teams",
    {
      schema: {
        params: z.object({
          sessionId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            teams: z.array(
              z.object({
                id: z.string().uuid(),
                sessionId: z.string().uuid(),
                name: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async request => {
      const { sessionId } = request.params

      const teams = await prisma.team.findMany({
        where: {
          sessionId,
        },
      })

      return { teams }
    },
  )
}
