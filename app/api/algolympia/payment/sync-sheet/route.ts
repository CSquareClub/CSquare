import { NextRequest, NextResponse } from "next/server";
import { listAlgolympiaRegistrations } from "@/lib/algolympia-registrations-store";
import {
  appendMultipleRegistrationsToSheet,
  appendMultiplePaymentConfirmationsToSheet,
} from "@/lib/google-sheets";

/**
 * POST /api/algolympia/payment/sync-sheet
 * 
 * Syncs registration and payment data from the database to Google Sheets.
 * 
 * Supported modes (via `mode` field in request body):
 * - "payment"       → Syncs all submitted payment proofs to "Payment Confirmation" sheet
 * - "registration"  → Syncs all registrations (with submitted payments) to "Sheet1"
 * - "all"           → Syncs both sheets
 * 
 * Protected by a simple secret key.
 * 
 * Usage:
 *   curl -X POST https://your-site.com/api/algolympia/payment/sync-sheet \
 *     -H "Content-Type: application/json" \
 *     -d '{"secret": "algolympia-sync-2026", "mode": "all"}'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = body?.secret;
    const mode = body?.mode || "all"; // "payment" | "registration" | "all"

    // Simple secret-based protection
    const expectedSecret = process.env.ADMIN_SYNC_SECRET || "algolympia-sync-2026";
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all registrations from DB
    const allRegistrations = await listAlgolympiaRegistrations();

    // Filter only those with submitted payment proofs
    const paidRegistrations = allRegistrations.filter(
      (r) => r.paymentStatus === "submitted" && r.paymentScreenshotUrl
    );

    const results: Record<string, any> = {};

    // Sync registrations (paid ones) to Sheet1
    if (mode === "registration" || mode === "all") {
      if (paidRegistrations.length === 0) {
        results.registration = {
          message: "No paid registrations found to sync.",
          count: 0,
        };
      } else {
        await appendMultipleRegistrationsToSheet(paidRegistrations);
        results.registration = {
          message: `Synced ${paidRegistrations.length} paid registration(s) to Sheet1.`,
          count: paidRegistrations.length,
        };
      }
    }

    // Sync payment confirmations to "Payment Confirmation" sheet
    if (mode === "payment" || mode === "all") {
      if (paidRegistrations.length === 0) {
        results.payment = {
          message: "No submitted payment proofs found to sync.",
          count: 0,
        };
      } else {
        await appendMultiplePaymentConfirmationsToSheet(paidRegistrations);
        results.payment = {
          message: `Synced ${paidRegistrations.length} payment confirmation(s) to Payment Confirmation sheet.`,
          count: paidRegistrations.length,
        };
      }
    }

    return NextResponse.json({
      success: true,
      totalRegistrations: allRegistrations.length,
      totalPaid: paidRegistrations.length,
      results,
    });
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
