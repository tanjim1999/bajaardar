import { Commodity, PricePoint } from "../types";

export interface CommodityForecast {
  commodityId: string;
  nameEn: string;
  nameBn: string;
  category: string;
  currentPrice: number;
  sma3: number;
  sma7: number;
  ema7: number;
  volatilityIndex: number; // percentage
  trendDirection: "UPWARD" | "DOWNWARD" | "STABLE";
  momentumPercent: number;
  forecast3Days: {
    projectedPrice: number;
    lowerBand: number;
    upperBand: number;
  };
  forecast7Days: {
    projectedPrice: number;
    lowerBand: number;
    upperBand: number;
  };
  confidenceScore: number; // 0 to 100%
  recommendation: "BUY_NOW" | "WAIT_FOR_DROP" | "NEUTRAL_BUY";
  recommendationReasonBn: string;
  recommendationReasonEn: string;
}

export function computeForecast(commodity: Commodity): CommodityForecast {
  const history = [...(commodity.priceHistory || [])];
  const prices = history.map((p) => p.price);

  if (prices.length === 0) {
    prices.push(commodity.currentAvgPrice);
  }

  // Current baseline
  const current = commodity.currentAvgPrice;

  // 1. Simple Moving Averages
  const last3 = prices.slice(-3);
  const sma3 = Math.round((last3.reduce((a, b) => a + b, 0) / last3.length) * 10) / 10;

  const last7 = prices.slice(-7);
  const sma7 = Math.round((last7.reduce((a, b) => a + b, 0) / last7.length) * 10) / 10;

  // 2. Exponential Moving Average (EMA 7 with multiplier k = 2 / (7 + 1))
  const k = 2 / (last7.length + 1);
  let ema7 = last7[0];
  for (let i = 1; i < last7.length; i++) {
    ema7 = last7[i] * k + ema7 * (1 - k);
  }
  ema7 = Math.round(ema7 * 10) / 10;

  // 3. Volatility (Standard Deviation of daily percentage deltas)
  let sumSquaredDiffs = 0;
  for (const p of last7) {
    sumSquaredDiffs += Math.pow(p - sma7, 2);
  }
  const stdDev = Math.sqrt(sumSquaredDiffs / last7.length);
  const volatilityIndex = Math.round((stdDev / (sma7 || 1)) * 1000) / 10;

  // 4. Momentum & Trend Direction
  const momentumPercent = Math.round(((current - (prices[0] || current)) / (prices[0] || 1)) * 1000) / 10;
  let trendDirection: "UPWARD" | "DOWNWARD" | "STABLE" = "STABLE";

  if (commodity.change24h > 1.2 || momentumPercent > 2.5) {
    trendDirection = "UPWARD";
  } else if (commodity.change24h < -1.2 || momentumPercent < -2.5) {
    trendDirection = "DOWNWARD";
  }

  // 5. Seasonal Harvest & Category Adjustment
  let categoryDrift = 0;
  if (commodity.category === "VEGETABLES") {
    // Winter vegetable supply dampens prices
    categoryDrift = -0.015;
  } else if (commodity.category === "PROTEIN") {
    // Protein and feed overhead exerts mild upward pressure
    categoryDrift = 0.01;
  }

  // 6. Projections
  const dailyRate = (commodity.change24h / 100) * 0.45 + categoryDrift;

  // 3-Day projection
  const proj3 = Math.round(current * (1 + dailyRate * 3) * 10) / 10;
  const band3Offset = Math.max(1, Math.round(stdDev * 1.2 * 10) / 10);

  // 7-Day projection
  const proj7 = Math.round(current * (1 + dailyRate * 7) * 10) / 10;
  const band7Offset = Math.max(2, Math.round(stdDev * 2.0 * 10) / 10);

  // 7. Confidence Score (Higher when history is stable, lower if high volatility)
  const confidenceScore = Math.min(96, Math.max(70, Math.round(92 - volatilityIndex * 1.8)));

  // 8. Consumer Recommendation
  let recommendation: "BUY_NOW" | "WAIT_FOR_DROP" | "NEUTRAL_BUY" = "NEUTRAL_BUY";
  let recommendationReasonBn = "বাজারের দর স্বাভাবিক গতিসীমায় রয়েছে। প্রয়োজনমতো নিয়মিত কেনাকাটা করুন।";
  let recommendationReasonEn = "Market rates within steady parameters. Regular purchases recommended.";

  if (trendDirection === "UPWARD" && proj7 > current * 1.05) {
    recommendation = "BUY_NOW";
    recommendationReasonBn = "আগামী সপ্তাহে দর বৃদ্ধির আশঙ্কা রয়েছে। পরিবারের প্রয়োজনীয় রসদ এখনই সংগ্রহ করা লাভজনক।";
    recommendationReasonEn = "Projected upward movement suggests stocking standard weekly requirements now.";
  } else if (trendDirection === "DOWNWARD" || proj7 < current * 0.95) {
    recommendation = "WAIT_FOR_DROP";
    recommendationReasonBn = "সরবরাহ বৃদ্ধির কারণে দর আরও কমতির দিকে। বাড়তি ক্রয় আপাতত স্থগিত রাখা বুদ্ধিমানের কাজ।";
    recommendationReasonEn = "Expected incoming supply yields lower projected pricing. Defer non-essential bulk buys.";
  }

  return {
    commodityId: commodity.id,
    nameEn: commodity.nameEn,
    nameBn: commodity.nameBn,
    category: commodity.category,
    currentPrice: current,
    sma3,
    sma7,
    ema7,
    volatilityIndex,
    trendDirection,
    momentumPercent,
    forecast3Days: {
      projectedPrice: proj3,
      lowerBand: Math.max(1, Math.round((proj3 - band3Offset) * 10) / 10),
      upperBand: Math.round((proj3 + band3Offset) * 10) / 10,
    },
    forecast7Days: {
      projectedPrice: proj7,
      lowerBand: Math.max(1, Math.round((proj7 - band7Offset) * 10) / 10),
      upperBand: Math.round((proj7 + band7Offset) * 10) / 10,
    },
    confidenceScore,
    recommendation,
    recommendationReasonBn,
    recommendationReasonEn,
  };
}
