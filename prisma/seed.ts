import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.panel.deleteMany()
  await prisma.teamBoosts.deleteMany()
  await prisma.teamCards.deleteMany()
  await prisma.teamGoals.deleteMany()
  await prisma.boost.deleteMany()
  await prisma.card.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.team.deleteMany()
  await prisma.session.deleteMany()
  await prisma.studentTeam.deleteMany()
  await prisma.student.deleteMany()
  await prisma.log.deleteMany()
}

main().then(() => console.log("Database seeded!"))
