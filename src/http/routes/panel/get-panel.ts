import { differenceInMinutes } from "date-fns"
import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "../../../errors/client-error"
import { prisma } from "../../../lib/prisma"

interface ParsedData {
  teamId: string
  goalId?: string
  boostId?: string
  cardId?: string
}

export async function getPanel(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/panel",
    {
      websocket: true,
      schema: {
        querystring: z.object({
          panelId: z.string().uuid(),
        }),
      },
    },
    async (connection, request) => {
      const { panelId } = request.query

      const [panel, session] = await Promise.all([
        prisma.panel.findUnique({
          where: {
            id: panelId,
          },
        }),
        prisma.session.findFirst({
          where: {
            panel: {
              id: panelId,
            },
          },
          include: {
            teams: {
              select: {
                id: true,
                name: true,
                teamGoals: true,
                teamCards: true,
                teamBoosts: true,
              },
            },
          },
        }),
      ])

      if (!session || !panel) {
        throw new ClientError("Panel not found")
      }

      connection.on("message", async (message, isBinary) => {
        const strMessage = isBinary
          ? JSON.stringify(message)
          : message.toString()

        const body: ParsedData = strMessage ? JSON.parse(strMessage) : {}

        if (body.goalId) {
          const teamGoals = await prisma.teamGoals.findFirst({
            where: {
              goalId: body.goalId,
              teamId: body.teamId,
            },
            include: {
              goal: true,
            },
          })

          if (teamGoals) {
            const diffInMinutes = differenceInMinutes(
              teamGoals.createdAt,
              teamGoals.goal.startedAt as Date,
            )

            const goalExpired = diffInMinutes > teamGoals.goal.time

            await prisma.teamGoals.update({
              where: {
                id: teamGoals.id,
              },
              data: {
                points: goalExpired ? 50 : 100,
              },
            })
          }
        }

        if (body.boostId) {
          const teamBoosts = await prisma.teamBoosts.findFirst({
            where: {
              boostId: body.boostId,
              teamId: body.teamId,
            },
          })

          if (teamBoosts) {
            await prisma.teamBoosts.create({
              data: {
                boostId: body.boostId,
                teamId: body.teamId,
              },
            })
          }
        }

        if (body.cardId) {
          const teamCards = await prisma.teamCards.findFirst({
            where: {
              cardId: body.cardId,
              teamId: body.teamId,
            },
          })

          if (!teamCards) {
            await prisma.teamCards.create({
              data: {
                cardId: body.cardId,
                teamId: body.teamId,
              },
            })
          }
        }

        const [goalScoreCount, cardScoreCount, boostScoreCount] =
          await Promise.all([
            prisma.teamGoals.findMany({
              where: {
                team: {
                  sessionId: session?.id,
                },
              },
              include: {
                team: true,
              },
            }),
            prisma.teamCards.findMany({
              where: {
                team: {
                  sessionId: session?.id,
                },
              },
              include: {
                team: true,
              },
            }),
            prisma.teamBoosts.findMany({
              where: {
                team: {
                  sessionId: session?.id,
                },
              },
              include: {
                team: true,
              },
            }),
          ])

        const panelScore = session?.teams.map(team => {
          const goalScore = goalScoreCount.reduce((accumulate, current) => {
            if (current.teamId === team.id) {
              accumulate += current.points ? current.points : 0

              return accumulate
            }

            return 0
          }, 0)
          const cardScore = cardScoreCount.reduce((accumulate, current) => {
            if (current.teamId === team.id) {
              accumulate += current.points ? current.points : 0

              return accumulate
            }

            return 0
          }, 0)
          const boostScore = boostScoreCount.reduce((accumulate, current) => {
            if (current.teamId === team.id) {
              accumulate += current.points ? current.points : 0

              return accumulate
            }

            return 0
          }, 0)

          const totalScore = goalScore + cardScore + boostScore

          return {
            team: {
              id: team.id,
              name: team.name,
              goalScore,
              cardScore,
              boostScore,
              totalScore,
            },
          }
        })

        app.websocketServer.clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(panelScore))
          }
        })
      })
    },
  )
}
