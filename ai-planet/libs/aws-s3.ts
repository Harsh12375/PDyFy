import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_BUCKET_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function getS3PresignedUrl(file_name: string) {

  
  if (!file_name) {
    return Response.json(
      { error: "File query parameter is required" },
      { status: 400 }
    );
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file_name,
  });

  const url = await getSignedUrl(client, command, { expiresIn: 60 });

  return url;
}
