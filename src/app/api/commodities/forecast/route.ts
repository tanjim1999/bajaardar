import { NextRequest, NextResponse } from "next/server";
import { getAllCommodities } from "@/lib/commodityStore";
import { computeForecast } from "@/lib/forecastEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const recommendation = searchParams.get("recommendation");

    let commodities = getAllCommodities();

    if (category && category !== "ALL") {
      commodities = commodities.filter((c) => c.category === category);
    }

    let forecasts = commodities.map((c) => computeForecast(c));

    if (recommendation) {
      forecasts = forecasts.filter((f) => f.recommendation === recommendation);
    }

    const buyNowCount = forecasts.filter((f) => f.recommendation === "BUY_NOW").length;
    const waitCount = forecasts.filter((f) => f.recommendation === "WAIT_FOR_DROP").length;
    const stableCount = forecasts.filter((f) => f.recommendation === "NEUTRAL_BUY").length;

    return NextResponse.json({
      success: true,
      meta: {
        totalTracked: forecasts.length,
        buyNowCount,
        waitCount,
        stableCount,
        engine: "BajaarDar Statistical Moving Average & Volatility Model",
        generatedAt: new Date().toISOString(),
      },
      data: forecasts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate market forecasts" },
      { status: 500 }
    );
  }
}
