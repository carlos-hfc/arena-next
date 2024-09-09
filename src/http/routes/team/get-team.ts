import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function getTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/sessions/:sessionId/teams/:teamId",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
            teamId: z.string().uuid(),
          }),
          // response: {
          //   200: z.object({
          //     team: z.object({
          //       id: z.string().uuid(),
          //       name: z.string(),
          //       sessionId: z.string().uuid(),
          //       students: z.array(
          //         z.object({
          //           id: z.string(),
          //           name: z.string(),
          //           email: z.string().nullable(),
          //           password: z.string().nullable(),
          //           role: z.union([
          //             z.literal(Role.STUDENT),
          //             z.literal(Role.PROFESSOR),
          //             z.literal(Role.SUPERPROFESSOR),
          //           ]),
          //           rm: z.string().nullable(),
          //           teamId: z.string().uuid().nullable(),
          //         }),
          //       ),
          //     }),
          //   }),
          // },
        },
      },
      async request => {
        const { sessionId, teamId } = request.params
        await request.getCurrentUserId()

        const team = await prisma.team.findUnique({
          where: {
            id: teamId,
            sessionId,
          },
          include: {
            students: true,
            teamGoals: true,
          },
        })

        if (!team) {
          throw new ClientError("Team not found")
        }

        return { team }
      },
    )
}
