import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function updateSession(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/sessions/:sessionId",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().min(4),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { sessionId } = request.params
        const { name } = request.body

        const userId = await request.getCurrentUserId()

        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
            createdById: userId,
          },
        })

        if (!session) {
          throw new ClientError("Session not found")
        }

        if (session.launchedAt) {
          throw new ClientError(
            "You're not allowed to update a launched session",
          )
        }

        await prisma.session.update({
          where: {
            id: sessionId,
          },
          data: {
            name,
            createdById: userId,
          },
        })

        reply.status(204)
      },
    )
}
