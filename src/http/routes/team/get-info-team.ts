import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"
import { auth } from "../../middlewares/auth"

export async function getInfoTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/sessions/:sessionId/teams/:teamId/info",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
            teamId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              team: z.object({
                id: z.string().uuid(),
                sessionId: z.string().uuid(),
                name: z.string(),
                teamGoals: z.array(
                  z.object({
                    goal: z.object({
                      id: z.string().uuid(),
                      sessionId: z.string().uuid(),
                      description: z.string(),
                      time: z.number().int(),
                      order: z.number().int(),
                    }),
                  }),
                ),
                teamCards: z.array(
                  z.object({
                    id: z.string().uuid(),
                    teamId: z.string().uuid(),
                    cardId: z.string().uuid(),
                    points: z.number().int(),
                    createdAt: z.coerce.date(),
                  }),
                ),
                teamBoosts: z.array(
                  z.object({
                    id: z.string().uuid(),
                    teamId: z.string().uuid(),
                    boostId: z.string().uuid(),
                    points: z.number().int(),
                    createdAt: z.coerce.date(),
                  }),
                ),
              }),
            }),
          },
        },
      },
      async request => {
        const userId = await request.getCurrentUserId()
        const { sessionId, teamId } = request.params

        const team = await prisma.team.findUnique({
          where: {
            id: teamId,
            sessionId,
            studentTeams: {
              some: {
                studentId: userId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            sessionId: true,
            teamGoals: {
              select: {
                goal: true,
              },
            },
            teamCards: true,
            teamBoosts: true,
          },
        })

        if (!team) {
          throw new ClientError("Team not found")
        }

        return { team }
      },
    )
}
