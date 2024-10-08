import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { auth } from "../../../http/middlewares/auth"
import { prisma } from "../../../lib/prisma"
import { r2Storage } from "../../../lib/r2-storage"

export async function sendGoal(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/sessions/:sessionId/teams/:teamId/goals/:goalId",
      {
        schema: {
          params: z.object({
            teamId: z.string().uuid(),
            goalId: z.string().uuid(),
            sessionId: z.string().uuid(),
          }),
        },
      },
      async (request, reply) => {
        const studentId = await request.getCurrentUserId()
        const { goalId, sessionId, teamId } = request.params

        const upload = await request.file()

        if (!upload) {
          throw new ClientError("File is required")
        }

        const { url } = await r2Storage({
          file: upload,
        })

        const goal = await prisma.goal.findUnique({
          where: {
            id: goalId,
            teamGoals: {
              none: {
                goalId,
              },
            },
            session: {
              id: sessionId,
              releasedAt: {
                not: null,
              },
              teams: {
                some: {
                  id: teamId,
                  studentTeams: {
                    some: {
                      studentId,
                    },
                  },
                },
              },
            },
          },
        })

        if (!goal) {
          throw new ClientError("goal não encontrado")
        }

        const teamGoal = await prisma.teamGoals.create({
          data: {
            goalId,
            sendedById: studentId,
            path: url,
            teamId,
          },
        })

        return {
          goal,
          teamGoal,
        }
      },
    )
}
