import { NextRequest, NextResponse } from "next/server";
import {
  handleGetPublishedEvents,
  handleGetFeaturedEvents,
} from "~/server/api/buyer-events";
import { z } from "zod";

// Validation schema for query parameters
const eventsQuerySchema = z.object({
  page: z.string().nullable().optional(),
  limit: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  featured: z
    .string()
    .nullable()
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
    console.log("GET /api/buyer/events - Request received");

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    console.log(
      "Query parameters:",
      Object.fromEntries(searchParams.entries()),
    );

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
      console.error("Invalid parameters:", parsedParams.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    console.log("Parsed parameters:", parsedParams.data);
    const { page, limit, search, category, startDate, endDate, featured } =
      parsedParams.data;

    // Check if we need to get featured events only
    if (featured === true) {
      console.log("Fetching featured events with limit:", limit);
      const featuredEvents = await handleGetFeaturedEvents(
        limit ? parseInt(limit, 10) : undefined,
      );
      console.log(`Found ${featuredEvents.length} featured events`);

      return NextResponse.json({
        success: true,
        data: featuredEvents,
      });
    }

    console.log("Fetching published events");
    // Get all events with pagination and filtering
    const result = await handleGetPublishedEvents({
      page: page || undefined,
      limit: limit || undefined,
      search: search || undefined,
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    console.log(
      `Found ${result.events.length} published events out of ${result.meta.total} total`,
    );

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
