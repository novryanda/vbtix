import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Implementasi untuk menangani webhook dari Xendit
    console.log("Received Xendit webhook:", data);
    
    // Proses webhook berdasarkan jenis event
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Xendit webhook:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
