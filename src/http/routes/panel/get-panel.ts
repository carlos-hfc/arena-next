import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { prisma } from "@/lib/prisma"

interface ParsedData {
  sendedById: string
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
          sessionId: z.string().uuid(),
          panelId: z.string().uuid(),
        }),
      },
    },
    // async (request, reply) => {
    //   const { sessionId, panelId } = request.query

    //   const body = request.body

    //   const session = await prisma.session.findUnique({
    //     where: {
    //       id: sessionId,
    //       panel: {
    //         id: panelId,
    //       },
    //     },
    //     include: {
    //       teams: {
    //         select: {
    //           id: true,
    //           name: true,
    //           teamGoals: true,
    //           teamCards: true,
    //           teamBoosts: true,
    //         },
    //       },
    //     },
    //   })

    //   const teamGoals = await prisma.teamGoals.findFirst({
    //     where: {
    //       goalId: body.goalId,
    //       teamId: body.teamId,
    //     },
    //   })

    //   if (!teamGoals) {
    //     await prisma.teamGoals.create({
    //       data: {
    //         goalId: body.goalId,
    //         teamId: body.teamId,
    //         sendedById: body.sendedById,
    //       },
    //     })
    //   }

    //   const [goalScoreCount, cardScoreCount, boostScoreCount] =
    //     await Promise.all([
    //       prisma.teamGoals.findMany({
    //         where: {
    //           team: {
    //             sessionId,
    //           },
    //         },
    //         include: {
    //           team: true,
    //         },
    //       }),
    //       prisma.teamCards.findMany({
    //         where: {
    //           team: {
    //             sessionId,
    //           },
    //         },
    //         include: {
    //           team: true,
    //         },
    //       }),
    //       prisma.teamBoosts.findMany({
    //         where: {
    //           team: {
    //             sessionId,
    //           },
    //         },
    //         include: {
    //           team: true,
    //         },
    //       }),
    //     ])

    //   const panelScore = session?.teams.map(team => {
    //     const goalScore = goalScoreCount.filter(
    //       item => item.teamId === team.id,
    //     ).length
    //     const cardScore = cardScoreCount.filter(
    //       item => item.teamId === team.id,
    //     ).length
    //     const boostScore = boostScoreCount.filter(
    //       item => item.teamId === team.id,
    //     ).length

    //     return {
    //       team: {
    //         id: team.id,
    //         name: team.name,
    //         goalScore,
    //         cardScore,
    //         boostScore,
    //       },
    //     }
    //   })

    //   return panelScore
    // },
    async (connection, request) => {
      connection.on("message", async (msg, isBinary) => {
        const strMessage = isBinary ? JSON.stringify(msg) : msg.toString()

        const params = new URL(request.url, "http://localhost:3333")
          .searchParams

        const sessionId = params.get("sessionId")?.toString()
        const panelId = params.get("panelId")?.toString()

        const session = await prisma.session.findUnique({
          where: {
            id: sessionId,
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
          connection.send(strMessage)
        }

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
              scored: false,
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
          }
        }

        if (body.cardId) {
          const teamCards = await prisma.teamCards.findFirst({
            where: {
              cardId: body.cardId,
              teamId: body.teamId,
              scored: false,
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
          }
        }

        const [goalScoreCount, cardScoreCount, boostScoreCount] =
          await Promise.all([
            prisma.teamGoals.findMany({
              where: {
                scored: true,
                team: {
                  sessionId,
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
                  sessionId,
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
                  sessionId,
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
            team: {
              id: team.id,
              name: team.name,
              goalScore,
              cardScore,
              boostScore,
            },
          }
        })

        connection.send(JSON.stringify(panelScore))
      })
    },
  )
}
