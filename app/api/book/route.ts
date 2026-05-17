import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { name, email, datetime, interest } = await req.json();

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: process.env.OWNER_EMAIL!,
            subject: `New Booking Request — ${name}`,
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;">
                    <h2 style="color:#f59e0b;">New Private Session Request</h2>
                    <table style="width:100%;">
                        <tr><td style="color:#888;font-size:12px;padding:8px 0;">Name</td><td>${name}</td></tr>
                        <tr><td style="color:#888;font-size:12px;padding:8px 0;">Email</td><td>${email || "Not provided"}</td></tr>
                        <tr><td style="color:#888;font-size:12px;padding:8px 0;">Date & Time</td><td>${datetime}</td></tr>
                        <tr><td style="color:#888;font-size:12px;padding:8px 0;">Looking For</td><td>${interest || "Not specified"}</td></tr>
                    </table>
                </div>
            `,
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Booking email error:", err);
        return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
}