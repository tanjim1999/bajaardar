import { NextRequest, NextResponse } from "next/server";
import { addReport, getSystemSettings, getCommodityById } from "@/lib/commodityStore";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (Max 8 submissions per 5 minutes per IP)
    const rateCheck = checkRateLimit(req, 8, 5 * 60 * 1000);
    const headers = {
      "X-RateLimit-Limit": rateCheck.limit.toString(),
      "X-RateLimit-Remaining": rateCheck.remaining.toString(),
      "X-RateLimit-Reset": rateCheck.resetSeconds.toString(),
    };

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many submissions from your connection. Please wait ${rateCheck.resetSeconds} seconds before submitting again.`,
        },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": rateCheck.resetSeconds.toString(),
          },
        }
      );
    }

    // 2. Global Crowdsourcing Policy
    const settings = getSystemSettings();
    if (!settings.crowdsourcingEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "Crowdsourced price reporting is temporarily paused by system administration.",
        },
        { status: 403, headers }
      );
    }

    const body = await req.json();
    if (!body.commodityId || !body.price || !body.marketName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: commodityId, price, and marketName are required" },
        { status: 400, headers }
      );
    }

    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0 || price > 50000) {
      return NextResponse.json(
        { success: false, message: "Invalid price value submitted. Must be a positive number up to ৳50,000." },
        { status: 400, headers }
      );
    }

    // 3. Statistical Anomaly & Outlier Screening
    const commodity = getCommodityById(body.commodityId);
    let autoVerified = settings.autoVerifyReports;
    let anomalyNote = "";

    if (commodity) {
      const avg = commodity.currentAvgPrice;
      const deviationRatio = Math.abs(price - avg) / avg;
      // If submitted price deviates by more than 150%, flag for admin moderation instead of instant auto-verification
      if (deviationRatio > 1.5) {
        autoVerified = false;
        anomalyNote = `Price deviation ${Math.round(deviationRatio * 100)}% differs sharply from benchmark ৳${avg}. Flagged for manual audit.`;
      }
    }

    const report = addReport({
      ...body,
      price,
      isVerified: autoVerified,
      status: autoVerified ? "VERIFIED" : "PENDING",
      adminNotes: anomalyNote || body.adminNotes,
    });

    return NextResponse.json(
      {
        success: true,
        message: autoVerified
          ? "Price report verified and blended into the live market index! Thank you for contributing to public market transparency."
          : "Price report submitted successfully and queued for verification. Thank you for contributing to market transparency.",
        data: report,
      },
      { status: 201, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit price report" },
      { status: 500 }
    );
  }
}
