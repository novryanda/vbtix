import { NextRequest, NextResponse } from "next/server";
import {
  handleGetPublishedEvents,
  handleGetFeaturedEvents,
} from "~/server/api/buyer-events";
import { z } from "zod";

// Validation schema for query parameters
const eventsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      return val.toLowerCase() === "true";
    }),
});

/**
 * GET /api/buyer/events
 * Get all published events with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const parsedParams = eventsQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      category: searchParams.get("category"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      featured: searchParams.get("featured"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit, search, category, startDate, endDate, featured } =
      parsedParams.data;

    // Check if we need to get featured events only
    if (featured === true) {
      const featuredEvents = await handleGetFeaturedEvents(
        limit ? parseInt(limit, 10) : undefined,
      );

      return NextResponse.json({
        success: true,
        data: featuredEvents,
      });
    }

    // Get all events with pagination and filtering
    const result = await handleGetPublishedEvents({
      page,
      limit,
      search,
      category,
      startDate,
      endDate,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting events:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get events" },
      { status: 500 },
    );
  }
}
