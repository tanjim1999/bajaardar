import { NextRequest, NextResponse } from "next/server";
import { getAllCommodities, getSystemSettings } from "@/lib/commodityStore";

export async function GET(req: NextRequest) {
  try {
    const commodities = getAllCommodities();
    const settings = getSystemSettings();
    const threshold = settings.inflationThresholdPercent || 8;

    const anomalies: {
      commodityId: string;
      nameEn: string;
      nameBn: string;
      type: "INFLATION_SPIKE" | "GOUGING_SPREAD" | "CRITICAL_SCARCITY" | "TCB_SUBSIDY_GAP";
      severity: "CRITICAL" | "HIGH" | "MODERATE";
      descriptionBn: string;
      descriptionEn: string;
      currentPrice: number;
      wholesalePrice: number;
      delta24h: number;
    }[] = [];

    for (const c of commodities) {
      // 1. Sudden 24h inflation spike
      if (c.change24h >= threshold) {
        anomalies.push({
          commodityId: c.id,
          nameEn: c.nameEn,
          nameBn: c.nameBn,
          type: "INFLATION_SPIKE",
          severity: c.change24h >= threshold * 1.5 ? "CRITICAL" : "HIGH",
          descriptionBn: `২৪ ঘণ্টায় মূল্যবৃদ্ধি ${c.change24h}% (সতর্কবার্তা সীমা: ${threshold}%)। আড়তে ঘাটতির লক্ষণ।`,
          descriptionEn: `24-hour price surge of ${c.change24h}% exceeds alert threshold of ${threshold}%.`,
          currentPrice: c.currentAvgPrice,
          wholesalePrice: c.wholesalePrice,
          delta24h: c.change24h,
        });
      }

      // 2. High retail-to-wholesale markup spread (> 35%)
      const markupPercent = Math.round(((c.currentAvgPrice - c.wholesalePrice) / c.wholesalePrice) * 100);
      if (markupPercent > 35) {
        anomalies.push({
          commodityId: c.id,
          nameEn: c.nameEn,
          nameBn: c.nameBn,
          type: "GOUGING_SPREAD",
          severity: markupPercent > 50 ? "HIGH" : "MODERATE",
          descriptionBn: `খুচরা বিক্রেতাদের মুনাফা ব্যবধান ${markupPercent}% (কাওরান বাজার পাইকারি থেকে অনেক বেশি)।`,
          descriptionEn: `Retail price markup is ${markupPercent}% above Karwan Bazar wholesale baseline.`,
          currentPrice: c.currentAvgPrice,
          wholesalePrice: c.wholesalePrice,
          delta24h: c.change24h,
        });
      }

      // 3. Critical scarcity
      if (c.supplyStatus === "SCARCE") {
        anomalies.push({
          commodityId: c.id,
          nameEn: c.nameEn,
          nameBn: c.nameBn,
          type: "CRITICAL_SCARCITY",
          severity: "HIGH",
          descriptionBn: "পাইকারি মোকামে সরবরাহে তীব্র ঘাটতি চিহ্নিত হয়েছে। জরুরি নজরদারি প্রয়োজন।",
          descriptionEn: "Severe wholesale supply disruption recorded at auction terminals.",
          currentPrice: c.currentAvgPrice,
          wholesalePrice: c.wholesalePrice,
          delta24h: c.change24h,
        });
      }

      // 4. Extreme TCB Subsidy Arbitrage Gap
      if (c.tcbPrice && c.currentAvgPrice >= c.tcbPrice * 1.5) {
        const subsidyGap = c.currentAvgPrice - c.tcbPrice;
        anomalies.push({
          commodityId: c.id,
          nameEn: c.nameEn,
          nameBn: c.nameBn,
          type: "TCB_SUBSIDY_GAP",
          severity: "MODERATE",
          descriptionBn: `সাধারণ খুচরা দর টিসিবির নির্ধারিত দরের চেয়ে ৳${subsidyGap} বেশি। সরকারি ট্রাক সেলের চাহিদা বৃদ্ধি পাবে।`,
          descriptionEn: `Retail price is ৳${subsidyGap} higher than TCB ration rates. High demand for truck sales expected.`,
          currentPrice: c.currentAvgPrice,
          wholesalePrice: c.wholesalePrice,
          delta24h: c.change24h,
        });
      }
    }

    const criticalCount = anomalies.filter((a) => a.severity === "CRITICAL").length;
    const highCount = anomalies.filter((a) => a.severity === "HIGH").length;
    const moderateCount = anomalies.filter((a) => a.severity === "MODERATE").length;

    // Overall Market Risk Score (0 = completely stable, 100 = extreme crisis)
    const riskScore = Math.min(100, Math.round(criticalCount * 25 + highCount * 12 + moderateCount * 4));

    return NextResponse.json({
      success: true,
      meta: {
        totalAnomaliesDetected: anomalies.length,
        criticalCount,
        highCount,
        moderateCount,
        marketRiskScore: riskScore,
        riskLevel: riskScore > 60 ? "HIGH_RISK" : riskScore > 30 ? "MODERATE_WATCH" : "STABLE",
        analyzedAt: new Date().toISOString(),
      },
      data: anomalies,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to scan market anomalies" },
      { status: 500 }
    );
  }
}
