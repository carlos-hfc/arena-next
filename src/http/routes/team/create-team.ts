import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function createTeam(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/sessions/:sessionId/teams",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().min(3),
          }),
          response: {
            201: z.object({
              teamId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { name } = request.body
        const { sessionId } = request.params

        await request.getCurrentUserId()

        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
          },
          include: {
            teams: true,
          },
        })

        if (!session) {
          throw new ClientError("Session not found")
        }

        if (session.teams.length >= 3) {
          throw new ClientError("This session already have 3 teams.")
        }

        const team = await prisma.team.create({
          data: {
            name,
            sessionId,
          },
        })

        return reply.status(201).send({ teamId: team.id })
      },
    )
}
