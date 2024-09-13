import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { extname, resolve } from "node:path"
import { pipeline } from "node:stream"
import { promisify } from "node:util"

import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

import { ClientError } from "@/errors/client-error"

const pump = promisify(pipeline)

export async function sendGoal(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/sessions/:sessionId/teams/:teamId",
    {
      schema: {
        params: z.object({
          teamId: z.string().uuid(),
          sessionId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const upload = await request.file()

      if (!upload) {
        throw new ClientError("File is required")
      }

      const fileId = randomUUID()
      const extension = extname(upload.filename)
      const filename = fileId.concat(extension)

      const writeStream = createWriteStream(
        resolve(__dirname, "..", "..", "..", "..", "uploads", filename),
      )

      await pump(upload.file, writeStream)

      return {
        filename,
        extension,
      }
    },
  )
}
