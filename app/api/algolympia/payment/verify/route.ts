import { NextRequest, NextResponse } from "next/server";
import { getRegistrationByPaymentEmail } from "@/lib/algolympia-registrations-store";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
    }
    
    const team = await getRegistrationByPaymentEmail(email);
    console.log(team);

    if (!team) {
      return NextResponse.json({ success: false, message: "Team not found with this email" }, { status: 404 });
    }

    if (team.isCU) {
      return NextResponse.json(
        { success: false, message: "CU students do not need to confirm payment via this form" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        teamName: team.teamName,
        leaderName: team.leaderName,
        leaderEmail: team.leaderEmail,
        member2Name: team.member2Name,
        member3Name: team.member3Name,
        paymentStatus: team.paymentStatus,
        transactionId: team.transactionId || null,
        paymentScreenshotUrl: team.paymentScreenshotUrl || null,
      },
    });
  } catch (error) {
    console.error("Error verifying payment email:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
