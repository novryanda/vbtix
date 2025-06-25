import { NextRequest, NextResponse } from "next/server";
import { getActiveBanners } from "~/server/services/banner.service";

/**
 * GET /api/public/banners
 * Get active banners for public display
 */
export async function GET(request: NextRequest) {
  try {
    // Get active banners
    const banners = await getActiveBanners();

    // Transform banners for public consumption
    const publicBanners = banners.map(banner => ({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      displayOrder: banner.displayOrder,
    }));

    return NextResponse.json({
      success: true,
      data: publicBanners,
    }, {
      headers: {
        // Cache for 5 minutes
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error("Error getting public banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get banners",
      },
      { status: 500 }
    );
  }
}
