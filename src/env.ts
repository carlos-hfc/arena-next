import z from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  BUCKET_PUBLIC_URL: z.string().url(),
  NODE_ENV: z.enum(["dev", "production"]).default("dev"),
})

export const env = envSchema.parse(process.env)
