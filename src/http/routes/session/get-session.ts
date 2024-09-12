import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function getSession(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/sessions/:sessionId",
      {
        schema: {
          params: z.object({
            sessionId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              session: z.object({
                id: z.string().uuid(),
                name: z.string(),
                launchedAt: z.date().nullable(),
                createdById: z.string().uuid(),
                teams: z.array(
                  z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    sessionId: z.string().uuid(),
                  }),
                ),
              }),
            }),
          },
        },
      },
      async request => {
        const { sessionId } = request.params

        const userId = await request.getCurrentUserId()

        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
            createdById: userId,
          },
          include: {
            teams: true,
          },
        })

        if (!session) {
          throw new ClientError("Session not found")
        }

        return { session }
      },
    )
}
