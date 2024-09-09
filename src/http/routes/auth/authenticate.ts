import { compare } from "bcryptjs"
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { prisma } from "@/lib/prisma"

export async function authenticate(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/auth",
    {
      schema: {
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (!userFromEmail) {
        throw new ClientError("Invalid credentials")
      }

      if (userFromEmail?.password) {
        const isPasswordValid = await compare(password, userFromEmail.password)

        if (!isPasswordValid) {
          throw new ClientError("Invalid credentials")
        }
      }

      const token = await reply.jwtSign(
        { sub: userFromEmail.id },
        { sign: { expiresIn: "7d" } },
      )

      return reply.send({ token })
    },
  )
}
