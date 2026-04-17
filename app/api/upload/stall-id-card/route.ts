import { randomUUID } from "crypto";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { ALGOLYMPIA_STALLS_ARE_CLOSED, ALGOLYMPIA_STALLS_CLOSED_MESSAGE } from "@/lib/algolympia-stalls-config";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getFileExtension(fileName: string): string {
  const extension = path.extname(fileName || "").toLowerCase();
  return extension.replace(".", "") || "jpg";
}

export async function POST(req: Request) {
  try {
    if (ALGOLYMPIA_STALLS_ARE_CLOSED) {
      return NextResponse.json(
        { error: ALGOLYMPIA_STALLS_CLOSED_MESSAGE },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("idCard");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ID card image is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "ID card image must be 5 MB or less" }, { status: 400 });
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
    const objectKey = `algolympia/stalls/id-cards/${Date.now()}-${randomUUID()}.${extension}`;

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

    const baseUrl =
      process.env.NEXT_PUBLIC_CLOUD_FRONT_URL?.replace(/\/$/, "") ||
      `https://${bucketName}.s3.${region}.amazonaws.com`;
    const url = `${baseUrl}/${objectKey}`;

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Failed to upload stall ID card", error);
    return NextResponse.json({ error: "ID card upload failed" }, { status: 500 });
  }
}
