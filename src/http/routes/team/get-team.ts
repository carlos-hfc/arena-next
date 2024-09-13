import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { prisma } from "@/lib/prisma"

export async function getTeam(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/sessions/:sessionId/teams/:teamId",
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
              name: z.string(),
              sessionId: z.string().uuid(),
              studentTeams: z.array(
                z.object({
                  id: z.string().uuid(),
                  teamId: z.string().uuid(),
                  student: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    rm: z.string().nullable(),
                  }),
                }),
              ),
            }),
          }),
        },
      },
    },
    async request => {
      const { sessionId, teamId } = request.params

      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
          sessionId,
        },
        select: {
          id: true,
          name: true,
          sessionId: true,
          studentTeams: {
            select: {
              id: true,
              teamId: true,
              student: true,
            },
          },
        },
      })

      if (!team) {
        throw new ClientError("Team not found")
      }

      return { team }
    },
  )
}
