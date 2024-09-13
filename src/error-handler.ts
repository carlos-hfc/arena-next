import { FastifyInstance } from "fastify"
import { ZodError } from "zod"

import { ClientError } from "./errors/client-error"

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errroHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ClientError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Invalid input",
      errors:
        error.flatten().formErrors.length > 0
          ? error.flatten().formErrors
          : error.flatten().fieldErrors,
    })
  }

  console.log(error)

  return reply
    .status(500)
    .send({ message: "Internal server error", error: JSON.stringify(error) })
}
