import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {

  const session = await getServerSession(authOptions);

  if(!session || !session.user){
    return NextResponse.json( { error: "Unauthorised" },
      { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const track = searchParams.get("track");
  

  try {
    if (track === "2026") {
      const data = await prisma.cusocRegistration2026.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(data);
    }

    if (track === "2027") {
      const data = await prisma.cusocRegistration2027.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(data);
    }

    // Return both counts for overview
    const [count2026, count2027] = await Promise.all([
      prisma.cusocRegistration2026.count(),
      prisma.cusocRegistration2027.count(),
    ]);

    return NextResponse.json({ count2026, count2027 });
  } catch (err) {
    console.error("Error fetching CUSoC registrations:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
