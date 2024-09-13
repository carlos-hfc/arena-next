import { FastifyReply } from "fastify"
import fastifyPlugin from "fastify-plugin"

import { prisma } from "@/lib/prisma"

interface LogFastifyReply extends FastifyReply {
  payload?: string
}

export const log = fastifyPlugin(async app => {
  app
    .addHook("preSerialization", (_, reply, payload, next) => {
      Object.assign(reply, { payload })
      next()
    })
    .addHook("onSend", async (request, reply: LogFastifyReply, payload) => {
      await prisma.log.create({
        data: {
          method: request.raw.method ?? request.method,
          url: request.raw.url ?? request.url,
          statusCode: reply.raw.statusCode ?? reply.statusCode,
          responseBody: JSON.stringify(reply.payload ?? payload) || null,
          requestBody: JSON.stringify(request.body) || null,
        },
      })
    })
})
