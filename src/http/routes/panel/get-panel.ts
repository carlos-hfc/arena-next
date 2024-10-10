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

      const session = await prisma.session.findFirst({
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
      })

      if (!session) {
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
              scored: false,
            },
          })

          if (teamGoals) {
            await prisma.teamGoals.update({
              where: {
                id: teamGoals.id,
              },
              data: {
                scored: true,
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
            await prisma.teamBoosts.update({
              where: {
                id: teamBoosts.id,
              },
              data: {
                scored: true,
              },
            })
          } else {
            await prisma.teamBoosts.create({
              data: {
                boostId: body.boostId,
                teamId: body.teamId,
                scored: true,
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

          if (teamCards) {
            await prisma.teamCards.update({
              where: {
                id: teamCards.id,
              },
              data: {
                scored: true,
              },
            })
          } else {
            await prisma.teamCards.create({
              data: {
                cardId: body.cardId,
                teamId: body.teamId,
                scored: true,
              },
            })
          }
        }

        const [goalScoreCount, cardScoreCount, boostScoreCount] =
          await Promise.all([
            prisma.teamGoals.findMany({
              where: {
                scored: true,
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
                scored: true,
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
                scored: true,
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
          const goalScore = goalScoreCount.filter(
            item => item.teamId === team.id,
          ).length
          const cardScore = cardScoreCount.filter(
            item => item.teamId === team.id,
          ).length
          const boostScore = boostScoreCount.filter(
            item => item.teamId === team.id,
          ).length

          return {
            session: {
              id: session.id,
            },
            team: {
              id: team.id,
              name: team.name,
              goalScore,
              cardScore,
              boostScore,
            },
          }
        })

        app.websocketServer.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(panelScore))
          }
        })
      })
    },
  )
}
