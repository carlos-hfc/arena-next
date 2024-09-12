import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { auth } from "@/http/middlewares/auth"
import { prisma } from "@/lib/prisma"

export async function getSessions(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/sessions",
      {
        schema: {
          response: {
            200: z.object({
              sessions: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  launchedAt: z.date().nullable(),
                  createdById: z.string().uuid(),
                }),
              ),
            }),
          },
        },
      },
      async request => {
        const userId = await request.getCurrentUserId()

        const sessions = await prisma.session.findMany({
          where: {
            createdById: userId,
          },
        })

        return { sessions }
      },
    )
}
