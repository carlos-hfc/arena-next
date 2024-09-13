import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"
import { prisma } from "@/lib/prisma"

export async function registerStudent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/teams/:teamId/students",
    {
      schema: {
        params: z.object({
          teamId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string(),
          rm: z
            .number()
            .min(10000)
            .transform(value => value.toString()),
        }),
        response: {
          201: z.object({
            studentId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { teamId } = request.params
      const { name, rm } = request.body

      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      })

      if (!team) {
        throw new ClientError("Team not found")
      }

      const student = await prisma.student.create({
        data: {
          name,
          rm,
          studentTeams: {
            create: {
              teamId,
            },
          },
        },
      })

      return reply.status(201).send({ studentId: student.id })
    },
  )
}
