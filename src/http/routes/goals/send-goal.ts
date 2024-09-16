import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { pipeline } from "node:stream"
import { promisify } from "node:util"

import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

const pump = promisify(pipeline)

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

        const fileId = randomUUID()
        const extension = extname(upload.filename)
        const filename = fileId.concat(extension)

        // const writeStream = createWriteStream(
        //   resolve(__dirname, "..", "..", "..", "..", "uploads", filename),
        // )

        // await pump(upload.file, writeStream)

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
            path: filename,
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
