import { randomUUID } from 'crypto';
import path from 'path';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function getFileExtension(fileName: string): string {
  const extension = path.extname(fileName || '').toLowerCase();
  return extension.replace('.', '') || 'pdf';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, DOC, and DOCX files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Resume file must be 5 MB or less' }, { status: 400 });
    }

    const region = process.env.AWS_REGION || "us-east-1";
    const bucketName = process.env.AWS_S3_BUCKET_NAME || "fellowship-vlsid-bucket";

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Missing AWS credentials");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const extension = getFileExtension(file.name);
    const objectKey = `resumes/${Date.now()}-${randomUUID()}.${extension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const baseUrl = 'https://d3staw4n9fwwx4.cloudfront.net';
    const url = `${baseUrl}/${objectKey}`;

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Failed to upload resume', error);
    return NextResponse.json({ error: 'Resume upload failed' }, { status: 500 });
  }
}
