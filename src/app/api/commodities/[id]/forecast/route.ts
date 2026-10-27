import { NextRequest, NextResponse } from "next/server";
import { getCommodityById } from "@/lib/commodityStore";
import { computeForecast } from "@/lib/forecastEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commodity = getCommodityById(id);

    if (!commodity) {
      return NextResponse.json(
        { success: false, message: `Commodity with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const forecast = computeForecast(commodity);

    // Generate date projections for next 7 days
    const nextDates: { date: string; expectedPrice: number }[] = [];
    const now = new Date();
    const dailyDelta = (forecast.forecast7Days.projectedPrice - commodity.currentAvgPrice) / 7;

    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const estPrice = Math.round((commodity.currentAvgPrice + dailyDelta * i) * 10) / 10;
      nextDates.push({
        date: d.toISOString().split("T")[0],
        expectedPrice: estPrice,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...forecast,
        dailyProjections: nextDates,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to compute commodity forecast" },
      { status: 500 }
    );
  }
}
