import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const { path, tag, secret } = await req.json();
    
    // Verifikasi secret untuk keamanan
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { success: false, message: "Invalid secret" },
        { status: 401 }
      );
    }
    
    if (path) {
      // Revalidasi path tertentu
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        message: `Path ${path} revalidated`
      });
    }
    
    if (tag) {
      // Revalidasi tag tertentu
      revalidateTag(tag);
      return NextResponse.json({
        success: true,
        message: `Tag ${tag} revalidated`
      });
    }
    
    return NextResponse.json(
      { success: false, message: "No path or tag provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { success: false, message: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
