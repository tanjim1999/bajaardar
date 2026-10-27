import { NextRequest, NextResponse } from "next/server";
import { getAllCommodities, getAllMarkets, getSystemSettings } from "@/lib/commodityStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "csv").toLowerCase();
    const category = searchParams.get("category");

    let commodities = getAllCommodities();
    if (category && category !== "ALL") {
      commodities = commodities.filter((c) => c.category === category);
    }

    const todayStr = new Date().toISOString().split("T")[0];

    if (format === "json") {
      const settings = getSystemSettings();
      const markets = getAllMarkets();

      return NextResponse.json({
        success: true,
        meta: {
          exportDate: todayStr,
          timestamp: new Date().toISOString(),
          totalRecords: commodities.length,
          source: "BajaarDar Bangladesh Daily Commodity Index",
          systemLastUpdated: settings.lastUpdated,
        },
        markets: markets.map((m) => ({ id: m.id, name: m.name, division: m.division, type: m.type })),
        commodities,
      });
    }

    // Default to CSV
    const headers = [
      "ID",
      "Name_English",
      "Name_Bengali",
      "Category",
      "Unit",
      "Retail_Price_BDT",
      "Wholesale_KarwanBazar_BDT",
      "TCB_Rate_BDT",
      "24h_Change_Percent",
      "Supply_Status",
      "Seasonal_Status",
      "Export_Date",
    ];

    const rows = commodities.map((c) => [
      c.id,
      `"${c.nameEn.replace(/"/g, '""')}"`,
      `"${c.nameBn.replace(/"/g, '""')}"`,
      c.category,
      c.unit,
      c.currentAvgPrice,
      c.wholesalePrice,
      c.tcbPrice || "N/A",
      c.change24h,
      c.supplyStatus || "IN_STOCK",
      c.seasonalStatus || "REGULAR",
      todayStr,
    ]);

    // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility with Bengali Unicode characters
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="bajaardar_prices_${todayStr}.csv"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate dataset export" },
      { status: 500 }
    );
  }
}
