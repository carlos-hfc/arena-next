import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function createGoal(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      "/sessions/:sessionId/goals",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
          }),
          body: z.object({
            description: z.string().min(6),
            time: z.number().int(),
          }),
          response: {
            201: z.object({
              goalId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { description, time } = request.body
        const { sessionId } = request.params

        await request.getCurrentUserId()

        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
          },
          include: {
            goals: true,
          },
        })

        if (!session) {
          throw new ClientError("Session not found")
        }

        if (session.goals.length >= 3) {
          throw new ClientError("This session already have 3 goals.")
        }

        const goal = await prisma.goal.create({
          data: {
            description,
            time,
            sessionId,
          },
        })

        return reply.status(201).send({ goalId: goal.id })
      },
    )
}
