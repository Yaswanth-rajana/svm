import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export async function setupR2Cors() {
  const bucketName = process.env.R2_BUCKET_NAME;
  console.log(`⏳ Applying CORS configuration to Cloudflare R2 bucket: "${bucketName}"...`);
  
  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: [
              "https://svm-3wfk.vercel.app",
              "https://smven.com",
              "https://www.smven.com",
              "http://localhost:5173",
              "http://localhost:3000",
              "*"
            ],
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type", "x-amz-request-id", "x-amz-id-2"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });
    
    await s3Client.send(command);
    console.log(`✅ Successfully updated CORS policy for Cloudflare R2 bucket: "${bucketName}"`);
    
    // Verify by getting CORS configuration
    const getCorsCommand = new GetBucketCorsCommand({ Bucket: bucketName });
    const corsRules = await s3Client.send(getCorsCommand);
    console.log("📋 Current R2 Bucket CORS Rules:", JSON.stringify(corsRules.CORSRules, null, 2));
    return true;
  } catch (err) {
    console.error("❌ Failed to set R2 CORS rules:", err);
    return false;
  }
}

if (process.argv[1].endsWith('setupR2Cors.js')) {
  setupR2Cors().then(() => process.exit(0));
}
