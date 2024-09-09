import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.teamBoosts.deleteMany()
  await prisma.teamCards.deleteMany()
  await prisma.teamGoals.deleteMany()
  await prisma.boost.deleteMany()
  await prisma.card.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.team.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.log.deleteMany()

  const password = await hash("123456", 6)

  // super professores
  const [superProfessor1, superProfessor2] = await Promise.all([
    prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@email.com",
        password,
        role: "SUPERPROFESSOR",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jane Doe",
        email: "janedoe@email.com",
        password,
        role: "SUPERPROFESSOR",
      },
    }),
  ])

  // sessões
  const [session1, session2] = await Promise.all([
    prisma.session.create({
      data: {
        name: "TINR",
        createdById: superProfessor1.id,
      },
    }),
    prisma.session.create({
      data: {
        name: "TDS",
        createdById: superProfessor2.id,
      },
    }),
  ])

  // time
  const team = await prisma.team.create({
    data: {
      name: "Wildcats",
      sessionId: session1.id,
    },
  })

  // alunos
  const [student1, student2, student3] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Carlos",
        role: "STUDENT",
        rm: faker.number.int({ min: 10000, max: 99999 }).toString(),
        teamId: team.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Fernando",
        role: "STUDENT",
        rm: faker.number.int({ min: 10000, max: 99999 }).toString(),
        teamId: team.id,
      },
    }),
    prisma.user.create({
      data: {
        name: "Caio",
        role: "STUDENT",
        rm: faker.number.int({ min: 10000, max: 99999 }).toString(),
        teamId: team.id,
      },
    }),
  ])

  // booosts
  const [boost1, boost2, boost3] = await Promise.all([
    prisma.boost.create({
      data: {
        description: "Quem fundou a Apple?",
        sessionId: session1.id,
      },
    }),
    prisma.boost.create({
      data: {
        description:
          "Qual linguagem de programação utiliza cifrão para criar variáveis?",
        sessionId: session1.id,
      },
    }),
    prisma.boost.create({
      data: {
        description: "HTML é uma linguagem de programação?",
        sessionId: session1.id,
      },
    }),
  ])

  // cards
  const [card1, card2, card3] = await Promise.all([
    prisma.card.create({
      data: {
        description: "Adicione acessibilidade",
        sessionId: session1.id,
      },
    }),
    prisma.card.create({
      data: {
        description: "Crie um menu na versão mobile",
        sessionId: session1.id,
      },
    }),
    prisma.card.create({
      data: {
        description: "Faça uma página de contato",
        sessionId: session1.id,
      },
    }),
  ])

  // objetivos
  const [goal1, goal2, goal3] = await Promise.all([
    prisma.goal.create({
      data: {
        description: "Construa uma landing page",
        time: 1000 * 60 * 60 * 5, // 5min
        sessionId: session1.id,
      },
    }),
    prisma.goal.create({
      data: {
        description: "Faça um menu para enviar o usuário às seções do site",
        time: 1000 * 60 * 60 * 5, // 5min
        sessionId: session1.id,
      },
    }),
    prisma.goal.create({
      data: {
        description: "Adicione um carrossel de imagens",
        time: 1000 * 60 * 60 * 5, // 5min
        sessionId: session1.id,
      },
    }),
  ])

  // painel
  const panel = await prisma.panel.create({
    data: {
      time: 1000 * 60 * 60 * 30, // 30min
      sessionId: session1.id,
    },
  })
}

main().then(() => console.log("Database seeded!"))
