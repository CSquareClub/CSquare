import { listAlgolympiaRegistrations } from "../lib/algolympia-registrations-store";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import 'dotenv/config';

// Initialize SES manually for the script execution
const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const DRY_RUN = process.env.DRY_RUN !== "false";

async function main() {
  console.log(`Starting to send CU AlgOlympia confirmation emails... ${DRY_RUN ? "[DRY RUN ENABLED - No emails will actually be sent. Compile with start prefix 'DRY_RUN=false' to execute]" : "[LIVE RUN]"}`);

  const allRegistrations = await listAlgolympiaRegistrations();
  const cuRegistrations = allRegistrations.filter(r => r.isCU);

  console.log(`Found ${cuRegistrations.length} CU participants.`);

  const sourceEmail = process.env.AWS_SES_FROM_EMAIL || "csquareclub@cumail.in";

  for (const reg of cuRegistrations) {
    const leaderEmail = reg.leaderEmail;
    const teamName = reg.teamName;

    if (!leaderEmail || !leaderEmail.includes("@")) {
      console.warn(`Skipping ${teamName} - Invalid email: ${leaderEmail}`);
      continue;
    }

    const command = new SendEmailCommand({
      Source: sourceEmail,
      Destination: { ToAddresses: [leaderEmail] },
      Message: {
        Subject: { Data: `AlgOlympia 2026 – Registration Confirmation & CUIMS Payment Instructions` },
        Body: {
          Html: {
            Data: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @media only screen and (max-width: 600px) {
    .main-wrap { padding: 0 !important; }
    .container { width: 100% !important; border-radius: 0 !important; border: none !important; }
    .logo-text { font-size: 15px !important; }
    .c-square-text { font-size: 14px !important; }
    .content-pad { padding: 30px 15px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" class="main-wrap" style="background:#f9f9f9;padding:20px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" class="container" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;max-width:600px;width:100%;">
  <tr><td style="padding:25px 20px;border-bottom:1px solid #f0f0f0;">
    <table width="100%"><tr>
      <td align="left"><strong class="logo-text" style="font-size:20px;color:#ffd232;">⚡ ALGOLYMPIA 2026</strong></td>
      <td align="right"><a href="https://www.csquareclub.co.in" style="text-decoration:none;"><strong class="c-square-text" style="font-size:16px;color:#333;">C Square</strong></a></td>
    </tr></table>
  </td></tr>
  <tr><td class="content-pad" style="padding:40px 30px;color:#333;line-height:1.6;font-size:16px;">
    <p style="font-size:18px;margin-top:0;">Dear <b>Participant</b>,</p>
    <p>Greetings from C Square Club, Chandigarh University, Punjab!</p>
    <p>We are pleased to inform you that your registration for <strong>AlgOlympia 2026</strong> has been successfully received. We are excited to have you join us for this global-level programming competition.</p>
    <p>All participants are requested to complete their registration by submitting the participation fee through CUIMS.</p>

    <h3 style="color:#92400e;margin-top:25px;">💳 Payment Details</h3>
    <ul>
      <li><strong>Amount:</strong> ₹100 per team member</li>
      <li><strong>Mode:</strong> Payment will be reflected on CUIMS</li>
      <li><strong>Note:</strong> Each team member must complete the payment individually through their CUIMS portal</li>
    </ul>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:15px;margin:20px 0;">
      <h4 style="color:#92400e;margin:0 0 10px 0;">⚠️ Important Note</h4>
      <ul style="color:#92400e;margin:0;font-size:14px;padding-left:20px;">
        <li>Once you have registered for AlgOlympia, participation is mandatory as the fee will be reflected on CUIMS soon and will not be removed.</li>
        <li>If you have exhausted your duty leaves, Special Duty Leave (IDL) will be provided.</li>
      </ul>
    </div>

    <h3 style="color:#166534;margin-top:25px;">✅ Next Steps</h3>
    <ol>
      <li>Complete the payment via CUIMS.</li>
      <li>Each team member must fill the confirmation form individually after payment.</li>
      <li>Upload the payment proof in the form for verification.</li>
      <li>Join the official WhatsApp group for updates and announcements:<br><a href="https://chat.whatsapp.com/GfKnKJ4KbNi486bOksarfx">https://chat.whatsapp.com/GfKnKJ4KbNi486bOksarfx</a></li>
    </ol>

    <p style="margin-top:20px;font-style:italic;">Please ensure that the payment and form submission are completed at the earliest to secure your participation.</p>
    <p style="margin-top:30px;">Looking forward to hosting you at AlgOlympia 2026!</p>
  </td></tr>
  <tr><td style="background:#fafafa;padding:20px;text-align:center;font-size:13px;color:#888;">
    <p style="margin:0;">AlgOlympia 2026 – C Square Club</p>
    <p style="margin:5px 0;"><a href="https://www.csquareclub.co.in" style="color:#888;">www.csquareclub.co.in</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
          },
          Text: {
            Data: `Dear Participant,\n\nGreetings from C Square Club, Chandigarh University, Punjab!\nWe are pleased to inform you that your registration for AlgOlympia 2026 has been successfully received. We are excited to have you join us for this global-level programming competition.\n\nAll participants are requested to complete their registration by submitting the participation fee through CUIMS.\n\nPayment Details:\n- Amount: ₹100 per team member\n- Mode: Payment will be reflected on CUIMS\n- Note: Each team member must complete the payment individually through their CUIMS portal\n\nImportant Note:\n- Once you have registered for AlgOlympia, participation is mandatory as the fee will be reflected on CUIMS soon and will not be removed.\n- If you have exhausted your duty leaves, Special Duty Leave (IDL) will be provided.\n\nNext Steps:\n1. Complete the payment via CUIMS.\n2. Each team member must fill the confirmation form individually after payment.\n3. Upload the payment proof in the form for verification.\n4. Join the official WhatsApp group for updates and announcements: https://chat.whatsapp.com/GfKnKJ4KbNi486bOksarfx\n\nPlease ensure that the payment and form submission are completed at the earliest to secure your participation.\n\nLooking forward to hosting you at AlgOlympia 2026!`,
          },
        },
      },
    });

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would send email to leader ${leaderEmail} for team: ${teamName}`);
    } else {
      try {
        await ses.send(command);
        console.log(`[LIVE] Sent email to leader ${leaderEmail} for team: ${teamName}`);
      } catch (err) {
        console.error(`[LIVE] Failed to send to ${leaderEmail}:`, err);
      }
    }
  }

  console.log("Done.");
}

main().catch(console.error);
