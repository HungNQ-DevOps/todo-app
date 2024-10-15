import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client()
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function getUploadUrl(imageId) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageId
  })

  return await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
}

export async function deleteAttachment(imageId) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: imageId
  })

  return await s3Client.send(command)
}
