import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { updatePaymentDetails } from "@/lib/algolympia-registrations-store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const idString = formData.get("id") as string;
    const transactionId = formData.get("transactionId") as string;
    const file = formData.get("screenshot") as File;

    if (!idString || !transactionId || !file) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const id = parseInt(idString, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare S3 Upload
    const region = process.env.AWS_REGION || "us-east-1";
    const bucketName = process.env.AWS_S3_BUCKET_NAME || "fellowship-vlsid-bucket";

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("Missing AWS credentials");
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Unique filename
    const extension = file.name.split(".").pop() || "png";
    const objectKey = `algolympia/payments/${id}-${Date.now()}.${extension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const baseUrl = process.env.NEXT_PUBLIC_CLOUD_FRONT_URL?.replace(/\/$/, "") || `https://${bucketName}.s3.${region}.amazonaws.com`;
    const s3Url = `${baseUrl}/${objectKey}`;

    // Update the database
    const updatedTeam = await updatePaymentDetails(id, transactionId, s3Url);

    return NextResponse.json({
      success: true,
      team: {
        id: updatedTeam.id,
        teamName: updatedTeam.teamName,
        paymentStatus: updatedTeam.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
