import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature") || "";
    
    // Implementasi untuk menangani webhook dari Stripe
    console.log("Received Stripe webhook");
    
    // Verifikasi signature dan proses webhook
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
