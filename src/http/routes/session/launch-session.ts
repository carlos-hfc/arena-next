import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function launchSession(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      "/sessions/:sessionId/lauch",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { sessionId } = request.params
        const userId = await request.getCurrentUserId()

        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
            createdById: userId,
            isVisible: false,
          },
        })

        if (!session) {
          throw new ClientError("Session not found")
        }

        await prisma.session.update({
          where: {
            id: sessionId,
          },
          data: {
            isVisible: true,
          },
        })

        reply.status(204)
      },
    )
}
