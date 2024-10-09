import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"
import { auth } from "../../middlewares/auth"

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      "/profile",
      {
        schema: {
          response: {
            200: z.object({
              student: z.object({
                id: z.string().uuid(),
                name: z.string(),
                rm: z.string(),
              }),
            }),
          },
        },
      },
      async request => {
        const userId = await request.getCurrentUserId()

        const student = await prisma.student.findUnique({
          where: {
            id: userId,
          },
        })

        if (!student) {
          throw new ClientError("Student not found")
        }

        return { student }
      },
    )
}
