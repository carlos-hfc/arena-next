import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"

export async function getSession(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
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
              releasedAt: z.date().nullable(),
              teams: z.array(
                z.object({
                  id: z.string().uuid(),
                  sessionId: z.string().uuid(),
                  name: z.string(),
                }),
              ),
              goals: z.array(
                z.object({
                  id: z.string().uuid(),
                  sessionId: z.string().uuid(),
                  description: z.string(),
                  time: z.number().int(),
                  order: z.number().int(),
                }),
              ),
              cards: z.array(
                z.object({
                  id: z.string().uuid(),
                  sessionId: z.string().uuid(),
                  description: z.string(),
                  createdAt: z.coerce.date(),
                }),
              ),
              boosts: z.array(
                z.object({
                  id: z.string().uuid(),
                  sessionId: z.string().uuid(),
                  description: z.string(),
                  createdAt: z.coerce.date(),
                }),
              ),
            }),
          }),
        },
      },
    },
    async request => {
      const { sessionId } = request.params

      const session = await prisma.session.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          teams: {
            orderBy: {
              name: "asc",
            },
          },
          goals: {
            orderBy: {
              order: "asc",
            },
          },
          boosts: {
            orderBy: {
              createdAt: "asc",
            },
          },
          cards: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      if (!session) {
        throw new ClientError("Session not found")
      }

      return { session }
    },
  )
}
