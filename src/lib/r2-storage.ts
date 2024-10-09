import { randomUUID } from "node:crypto"
import { createWriteStream } from "node:fs"
import { resolve } from "node:path"
import { pipeline } from "node:stream"
import { promisify } from "node:util"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { MultipartFile } from "@fastify/multipart"

import { env } from "../env"

const pump = promisify(pipeline)

const accountId = env.CLOUDFLARE_ACCOUNT_ID

const client = new S3Client({
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

interface UploadParams {
  file: MultipartFile
}

export async function r2Storage({ file }: UploadParams) {
  const uploadId = randomUUID()
  const uploadFilename = `${uploadId}-${file.filename}`

  if (env.NODE_ENV === "dev") {
    const writeStream = createWriteStream(
      resolve(__dirname, "..", "..", "uploads", uploadFilename),
    )

    await pump(file.file, writeStream)
  } else {
    const Body = await file.toBuffer()

    await client.send(
      new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: uploadFilename,
        ContentType: file.mimetype,
        Body,
      }),
    )
  }

  return {
    url: `${env.BUCKET_PUBLIC_URL}/${uploadFilename}`,
  }
}
