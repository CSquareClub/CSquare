import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createStallRegistration,
  checkDuplicateStallEmail,
} from "@/lib/algolympia-stalls-store";
import { appendStallRegistrationToSheet } from "@/lib/google-sheets";
import { isAlgolympiaStallsOtpVerified, markAlgolympiaStallsOtpUsed } from "@/lib/algolympia-stalls-otp-store";

/* -- Schema -- */

const memberSchema = z.object({
  name: z.string().min(2, "Member name is required"),
  email: z.string().email("Valid member email required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Valid member phone required"),
});

const stallRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Valid phone number required"),
  college: z.string().optional().default(""),
  stallCategory: z.enum(["products_games", "food_beverage"], { required_error: "Stall category is required" }),
  isPremium: z.boolean().default(false),
  numberOfDays: z.number().min(1).max(2).default(2),
  selectedDate: z.string().optional().default(""),
  stallName: z.string().min(2, "Stall name is required"),
  stallDescription: z.string().min(10, "Stall description is required (min 10 chars)"),
  members: z.array(memberSchema).max(5, "Maximum 5 additional members allowed").optional().default([]),
});

/* -- POST handler -- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = stallRegistrationSchema.parse(body);

    // Duplicate checks allowed per user request

    // Verify OTP using the separated stalls OTP table
    const otpVerified = await isAlgolympiaStallsOtpVerified(data.email);
    if (!otpVerified) {
      return NextResponse.json(
        { error: "Email verification (OTP) is required before registering a stall." },
        { status: 403 }
      );
    }

    // Create registration
    const registration = await createStallRegistration({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      college: data.college || "",
      stallCategory: data.stallCategory,
      isPremium: data.isPremium,
      numberOfDays: data.numberOfDays,
      selectedDate: data.selectedDate,
      stallName: data.stallName,
      stallDescription: data.stallDescription,
      members: data.members || [],
    });

    // Append to Google Sheets async
    appendStallRegistrationToSheet({
      ...registration,
    }).catch(console.error);

    // Mark OTP as used
    await markAlgolympiaStallsOtpUsed(data.email).catch(console.error);

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.errors },
        { status: 422 }
      );
    }
    console.error("Stall registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
