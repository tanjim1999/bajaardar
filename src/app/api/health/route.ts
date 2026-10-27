import { NextResponse } from "next/server";
import { getAdminStats, getAllCommodities, getSystemSettings } from "@/lib/commodityStore";

export async function GET() {
  const startTime = Date.now();
  const mem = process.memoryUsage();
  const stats = getAdminStats();
  const settings = getSystemSettings();
  const commodities = getAllCommodities();

  const latencyMs = Date.now() - startTime;

  return NextResponse.json({
    status: "healthy",
    service: "BajaarDar (বাজার দর) Next.js Fullstack Engine",
    version: "2.1.0",
    platform: process.env.VERCEL ? "Vercel Serverless Fluid Compute" : "Local Node.js Development",
    region: process.env.VERCEL_REGION || "local",
    runtime: {
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMB: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
        heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
      },
    },
    database: {
      engine: "Persistent JSON Store (Serverless /tmp compatible)",
      totalCommodities: commodities.length,
      totalReports: stats.totalReports,
      pendingReports: stats.pendingReports,
      verifiedReports: stats.verifiedReports,
      activeMarkets: stats.activeMarkets,
      activeBulletins: stats.activeBulletins,
      lastUpdated: settings.lastUpdated,
    },
    diagnostics: {
      crowdsourcingActive: settings.crowdsourcingEnabled,
      autoVerificationActive: settings.autoVerifyReports,
      inflationThresholdPercent: settings.inflationThresholdPercent,
      emergencyCeilingMode: settings.emergencyCeilingMode,
      latencyMs,
    },
    timestamp: new Date().toISOString(),
  });
}
