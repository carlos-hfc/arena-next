import "fastify"

interface GetCurrentUserParams {
  optional?: boolean
}

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentUserId(params?: GetCurrentUserParams): Promise<string | undefined>
  }
}
