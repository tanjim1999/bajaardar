import { NextRequest, NextResponse } from "next/server";
import { getAllCommodities } from "@/lib/commodityStore";

interface TcbSubsidyItem {
  commodityKey: string;
  nameBn: string;
  nameEn: string;
  tcbRate: number;
  marketRetailRate: number;
  unit: string;
  unitBn: string;
  familyCardMonthlyQuota: number;
  savingsPerUnit: number;
  savingsPercentage: number;
  packageMonthlyCost: number;
}

export async function GET(req: NextRequest) {
  try {
    const commodities = getAllCommodities();

    const findRate = (keywords: string[], fallback: number): number => {
      const match = commodities.find((c) =>
        keywords.some((k) => c.nameEn.toLowerCase().includes(k) || c.nameBn.includes(k))
      );
      return match ? match.currentAvgPrice : fallback;
    };

    const definitions = [
      { key: "soybean-oil", nameBn: "সয়াবিন তেল", nameEn: "Soybean Oil", tcbRate: 100, unit: "L", unitBn: "লিটার", quota: 2, keywords: ["soybean", "oil", "সয়াবিন"], defaultMarket: 170 },
      { key: "masoor-dal", nameBn: "মসুর ডাল (আমদানিকৃত)", nameEn: "Masoor Dal (Imported)", tcbRate: 60, unit: "kg", unitBn: "কেজি", quota: 2, keywords: ["masoor", "dal", "মসুর"], defaultMarket: 110 },
      { key: "local-onion", nameBn: "দেশি পেঁয়াজ", nameEn: "Local Onion", tcbRate: 70, unit: "kg", unitBn: "কেজি", quota: 2, keywords: ["onion", "পেঁয়াজ"], defaultMarket: 95 },
      { key: "potato", nameBn: "গোল আলু", nameEn: "Potato", tcbRate: 40, unit: "kg", unitBn: "কেজি", quota: 3, keywords: ["potato", "আলু"], defaultMarket: 55 },
      { key: "coarse-rice", nameBn: "আটাশ চাল (ওএমএস)", nameEn: "Atash Rice (OMS/TCB)", tcbRate: 30, unit: "kg", unitBn: "কেজি", quota: 5, keywords: ["rice", "চাল"], defaultMarket: 65 },
    ];

    const items: TcbSubsidyItem[] = definitions.map((def) => {
      const marketRate = findRate(def.keywords, def.defaultMarket);
      const savingsPerUnit = Math.max(0, marketRate - def.tcbRate);
      const savingsPercentage = Math.round((savingsPerUnit / marketRate) * 100);
      const packageMonthlyCost = def.tcbRate * def.quota;

      return {
        commodityKey: def.key,
        nameBn: def.nameBn,
        nameEn: def.nameEn,
        tcbRate: def.tcbRate,
        marketRetailRate: marketRate,
        unit: def.unit,
        unitBn: def.unitBn,
        familyCardMonthlyQuota: def.quota,
        savingsPerUnit,
        savingsPercentage,
        packageMonthlyCost,
      };
    });

    const totalTcbCost = items.reduce((sum, i) => sum + i.packageMonthlyCost, 0);
    const totalMarketCost = items.reduce((sum, i) => sum + i.marketRetailRate * i.familyCardMonthlyQuota, 0);
    const netFamilySavings = totalMarketCost - totalTcbCost;

    return NextResponse.json({
      success: true,
      meta: {
        totalSubsidizedItems: items.length,
        totalTcbMonthlyPackageCost: totalTcbCost,
        totalEquivalentMarketCost: totalMarketCost,
        totalMonthlyFamilySavings: netFamilySavings,
        savingsPercentage: Math.round((netFamilySavings / totalMarketCost) * 100),
        officialNotice: "Ministry of Commerce subsidized food assistance for 10 million family cardholders",
        timestamp: new Date().toISOString(),
      },
      data: items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch TCB subsidy data" },
      { status: 500 }
    );
  }
}
