import fs from "fs";
import path from "path";
import {
  Commodity,
  PriceReport,
  Announcement,
  SystemSettings,
  AuditLog,
  AdminStats,
  MarketHub,
  ReportStatus,
} from "../types";
import { INITIAL_COMMODITIES } from "./initialCommodities";
import { BANGLADESH_MARKETS } from "./markets";

// Path to persistent store (uses /tmp on Vercel serverless environment)
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "bajaardar-data")
  : path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

interface PersistentStoreState {
  commodities: Commodity[];
  reports: PriceReport[];
  announcements: Announcement[];
  markets: MarketHub[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
}

const DEFAULT_SETTINGS: SystemSettings = {
  crowdsourcingEnabled: true,
  autoVerifyReports: false,
  tcbSubsidyAlerts: true,
  inflationThresholdPercent: 8,
  emergencyCeilingMode: false,
  tickerSpeed: "normal",
  customTickerMessageBn: "কাওরান বাজার ও শ্যামবাজারের দৈনিক পাইকারি দর সরাসরি হালনাগাদ হচ্ছে",
  customTickerMessageEn: "Daily wholesale price index directly tracked from Karwan Bazar and Khatunganj",
  adminPasscode: "admin123",
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann_1",
    titleEn: "TCB Open-Truck Subsidized Sales Active Across 50 Dhaka Points",
    titleBn: "ঢাকা শহরের ৫০টি স্থানে টিসিবির ভ্রাম্যমাণ ট্রাক সেল চালু রয়েছে",
    messageEn: "Subsidized potato at ৳40/kg, local onion at ৳70/kg, and soybean oil at ৳100/liter available for family cardholders.",
    messageBn: "ফ্যামিলি কার্ডধারীদের জন্য আলু প্রতি কেজি ৪০ টাকা, দেশি পেঁয়াজ ৭০ টাকা এবং সয়াবিন তেল ১০০ টাকা লিটার দরে বিক্রি হচ্ছে।",
    level: "TCB",
    isActive: true,
    targetMarket: "Dhaka",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ann_2",
    titleEn: "Winter Vegetable Supply Inflow Stabilizes Karwan Bazar Rates",
    titleBn: "কাওরান বাজারে শীতকালীন আগাম সবজির পর্যাপ্ত সরবরাহ শুরু",
    messageEn: "Vegetable consignments from Bogura, Jashore and Narsingdi have stabilized wholesale auction prices by 12%.",
    messageBn: "বগুড়া, যশোর ও নরসিংদী থেকে কাঁচামালের নতুন চালানে পাইকারি মোকামে শাক-সবজির গড় দর ১২% হ্রাস পেয়েছে।",
    level: "INFO",
    isActive: true,
    targetMarket: "Karwan Bazar",
    createdAt: new Date().toISOString(),
  },
];

const buildInitialState = (): PersistentStoreState => {
  const commodities: Commodity[] = INITIAL_COMMODITIES.map((c, idx) => ({
    ...c,
    id: `comm_${idx + 1}`,
    supplyStatus: idx % 4 === 0 ? "SCARCE" : idx % 3 === 0 ? "MODERATE" : "IN_STOCK",
    seasonalStatus: idx % 5 === 0 ? "IN_SEASON" : "REGULAR",
    priceHistory: c.priceHistory || [],
    reports: [],
  }));

  const reports: PriceReport[] = [
    {
      id: "rep_1",
      commodityId: "comm_10", // Deshi Piaj
      commodityNameEn: "Deshi Onion",
      commodityNameBn: "দেশি পেঁয়াজ",
      commodityIcon: "🧅",
      marketName: "Karwan Bazar",
      division: "Dhaka",
      district: "Dhaka",
      price: 95,
      type: "RETAIL",
      reporterName: "Rafiqul Islam",
      reporterPhone: "01711-XXXXXX",
      isVerified: true,
      status: "VERIFIED",
      adminNotes: "Verified via physical spot-check",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: "rep_2",
      commodityId: "comm_5", // Potato
      commodityNameEn: "Diamond Potato",
      commodityNameBn: "ডায়মন্ড গোল আলু",
      commodityIcon: "🥔",
      marketName: "Mirpur-1 Kacha Bazar",
      division: "Dhaka",
      district: "Dhaka",
      price: 55,
      type: "RETAIL",
      reporterName: "Sumon Khan",
      reporterPhone: "01819-XXXXXX",
      isVerified: true,
      status: "VERIFIED",
      adminNotes: "Consistent with Munshiganj cold storage releases",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "rep_3",
      commodityId: "comm_16", // Broiler Chicken
      commodityNameEn: "Broiler Chicken",
      commodityNameBn: "ব্রয়লার মুরগি",
      commodityIcon: "🍗",
      marketName: "Khatunganj",
      division: "Chattogram",
      district: "Chattogram",
      price: 165,
      type: "WHOLESALE",
      reporterName: "Jahangir Alam",
      reporterPhone: "01912-XXXXXX",
      isVerified: true,
      status: "VERIFIED",
      adminNotes: "Direct wholesale invoice report",
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: "rep_4",
      commodityId: "comm_12", // Green Chili
      commodityNameEn: "Green Chili",
      commodityNameBn: "কাঁচা মরিচ",
      commodityIcon: "🌶️",
      marketName: "Mohammadpur Krishi Market",
      division: "Dhaka",
      district: "Dhaka",
      price: 260,
      type: "RETAIL",
      reporterName: "Tanvir Ahmed",
      reporterPhone: "01678-XXXXXX",
      isVerified: false,
      status: "PENDING",
      adminNotes: "Price looks slightly high, pending review",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  const markets: MarketHub[] = BANGLADESH_MARKETS.map((m, idx) => ({
    id: `mkt_${idx + 1}`,
    name: m.name,
    nameBn: m.nameBn,
    division: m.division,
    district: m.district,
    type: m.type,
    description: m.description,
    status: idx === 3 ? "SPECIAL_MONITOR" : "ACTIVE",
  }));

  const auditLogs: AuditLog[] = [
    {
      id: "log_1",
      action: "SYSTEM_INITIALIZE",
      details: "BajaarDar dynamic store initialized with Bangladesh market indices",
      actor: "SYSTEM",
      timestamp: new Date().toISOString(),
    },
  ];

  return {
    commodities,
    reports,
    announcements: DEFAULT_ANNOUNCEMENTS,
    markets,
    settings: DEFAULT_SETTINGS,
    auditLogs,
  };
};

// In-Memory cache singleton
let memoryStore: PersistentStoreState | null = null;

const ensureLoaded = (): PersistentStoreState => {
  if (memoryStore) return memoryStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      memoryStore = JSON.parse(raw);
      return memoryStore!;
    }
  } catch (err) {
    console.error("Error reading persistent store, falling back to initial state:", err);
  }

  memoryStore = buildInitialState();
  saveStore();
  return memoryStore;
};

const saveStore = () => {
  if (!memoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist store to disk:", err);
  }
};

// ==========================================
// COMMODITIES QUERIES & MUTATIONS
// ==========================================

export const getAllCommodities = (filter?: {
  category?: string;
  search?: string;
  sortBy?: string;
}) => {
  const store = ensureLoaded();
  let list = [...store.commodities];

  if (filter?.category && filter.category !== "ALL") {
    list = list.filter((c) => c.category === filter.category);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameBn.includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  if (filter?.sortBy === "price_asc") list.sort((a, b) => a.currentAvgPrice - b.currentAvgPrice);
  else if (filter?.sortBy === "price_desc") list.sort((a, b) => b.currentAvgPrice - a.currentAvgPrice);
  else if (filter?.sortBy === "change_desc") list.sort((a, b) => b.change24h - a.change24h);
  else if (filter?.sortBy === "change_asc") list.sort((a, b) => a.change24h - b.change24h);
  else list.sort((a, b) => a.nameEn.localeCompare(b.nameEn));

  return list.map((item) => ({
    ...item,
    reports: store.reports.filter((r) => r.commodityId === item.id && r.status === "VERIFIED"),
  }));
};

export const getSingleCommodity = (id: string) => {
  const store = ensureLoaded();
  const item = store.commodities.find((c) => c.id === id);
  if (!item) return null;
  return {
    ...item,
    reports: store.reports.filter((r) => r.commodityId === id),
  };
};

export const getCommodityById = getSingleCommodity;

export const createCommodity = (input: Omit<Commodity, "id" | "priceHistory"> & { id?: string }) => {
  const store = ensureLoaded();
  const id = input.id || `comm_${Date.now()}`;
  const todayStr = new Date().toISOString().split("T")[0];

  const newComm: Commodity = {
    id,
    nameEn: input.nameEn,
    nameBn: input.nameBn,
    category: input.category,
    unit: input.unit || "kg",
    unitBn: input.unitBn || "কেজি",
    icon: input.icon || "📦",
    currentAvgPrice: Number(input.currentAvgPrice),
    wholesalePrice: Number(input.wholesalePrice) || Math.round(Number(input.currentAvgPrice) * 0.88),
    tcbPrice: input.tcbPrice ? Number(input.tcbPrice) : undefined,
    change24h: Number(input.change24h) || 0,
    supplyStatus: input.supplyStatus || "IN_STOCK",
    seasonalStatus: input.seasonalStatus || "REGULAR",
    isFeatured: input.isFeatured || false,
    priceHistory: [
      { date: todayStr, price: Number(input.currentAvgPrice) }
    ],
  };

  store.commodities.unshift(newComm);
  addAuditLog("CREATE_COMMODITY", `Added new commodity: ${newComm.nameEn} (${newComm.nameBn}) at ৳${newComm.currentAvgPrice}`, "ADMIN");
  saveStore();
  return newComm;
};

export const updateCommodity = (id: string, updates: Partial<Commodity>) => {
  const store = ensureLoaded();
  const idx = store.commodities.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const current = store.commodities[idx];
  const oldPrice = current.currentAvgPrice;
  const newPrice = updates.currentAvgPrice !== undefined ? Number(updates.currentAvgPrice) : oldPrice;

  let calculatedChange = current.change24h;
  if (updates.change24h !== undefined) {
    calculatedChange = Number(updates.change24h);
  } else if (newPrice !== oldPrice && oldPrice > 0) {
    calculatedChange = Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const history = [...(current.priceHistory || [])];
  const todayIdx = history.findIndex((h) => h.date === todayStr);

  if (todayIdx >= 0) {
    history[todayIdx].price = newPrice;
  } else {
    history.push({ date: todayStr, price: newPrice });
  }

  const updated: Commodity = {
    ...current,
    ...updates,
    currentAvgPrice: newPrice,
    wholesalePrice: updates.wholesalePrice !== undefined ? Number(updates.wholesalePrice) : current.wholesalePrice,
    tcbPrice: updates.tcbPrice !== undefined ? (updates.tcbPrice ? Number(updates.tcbPrice) : undefined) : current.tcbPrice,
    change24h: calculatedChange,
    priceHistory: history,
  };

  store.commodities[idx] = updated;
  addAuditLog(
    "UPDATE_COMMODITY",
    `Updated ${updated.nameEn}: Retail ৳${newPrice}, Wholesale ৳${updated.wholesalePrice}, Supply: ${updated.supplyStatus}`,
    "ADMIN"
  );
  saveStore();
  return updated;
};

export const deleteCommodity = (id: string) => {
  const store = ensureLoaded();
  const idx = store.commodities.findIndex((c) => c.id === id);
  if (idx === -1) return false;

  const [removed] = store.commodities.splice(idx, 1);
  addAuditLog("DELETE_COMMODITY", `Deleted commodity ${removed.nameEn} (${removed.nameBn})`, "ADMIN");
  saveStore();
  return true;
};

export const bulkAdjustCommodities = ({
  category,
  percentage,
  flatAmount,
}: {
  category?: string;
  percentage?: number;
  flatAmount?: number;
}) => {
  const store = ensureLoaded();
  let affected = 0;

  store.commodities.forEach((c) => {
    if (!category || category === "ALL" || c.category === category) {
      let newPrice = c.currentAvgPrice;
      if (percentage) {
        newPrice = Math.round(newPrice * (1 + percentage / 100));
      }
      if (flatAmount) {
        newPrice = Math.max(1, newPrice + flatAmount);
      }
      if (newPrice !== c.currentAvgPrice) {
        const oldPrice = c.currentAvgPrice;
        c.change24h = Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;
        c.currentAvgPrice = newPrice;
        c.wholesalePrice = Math.round(c.wholesalePrice * (newPrice / oldPrice));
        affected++;
      }
    }
  });

  addAuditLog(
    "BULK_ADJUST",
    `Bulk adjusted ${affected} items in ${category || "ALL"} (pct: ${percentage || 0}%, flat: ৳${flatAmount || 0})`,
    "ADMIN"
  );
  saveStore();
  return { success: true, affectedCount: affected };
};

// ==========================================
// PRICE REPORTS & MODERATION
// ==========================================

export const getAllReports = (filter?: { status?: string; commodityId?: string }) => {
  const store = ensureLoaded();
  let list = [...store.reports];

  if (filter?.status && filter.status !== "ALL") {
    list = list.filter((r) => r.status === filter.status);
  }

  if (filter?.commodityId) {
    list = list.filter((r) => r.commodityId === filter.commodityId);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addReport = (reportInput: {
  commodityId: string;
  marketName: string;
  division: string;
  district: string;
  price: number;
  type?: "RETAIL" | "WHOLESALE";
  reporterName?: string;
  reporterPhone?: string;
}) => {
  const store = ensureLoaded();
  const settings = store.settings;
  const targetComm = store.commodities.find((c) => c.id === reportInput.commodityId);

  const isAutoVerified = settings.autoVerifyReports;
  const status: ReportStatus = isAutoVerified ? "VERIFIED" : "PENDING";

  const newReport: PriceReport = {
    id: `rep_${Date.now()}`,
    commodityId: reportInput.commodityId,
    commodityNameEn: targetComm?.nameEn || "Commodity",
    commodityNameBn: targetComm?.nameBn || "পণ্য",
    commodityIcon: targetComm?.icon || "🛒",
    marketName: reportInput.marketName,
    division: reportInput.division,
    district: reportInput.district,
    price: Number(reportInput.price),
    type: reportInput.type || "RETAIL",
    reporterName: reportInput.reporterName || "General Consumer",
    reporterPhone: reportInput.reporterPhone || "",
    isVerified: isAutoVerified,
    status,
    adminNotes: isAutoVerified ? "Auto-verified by system rule" : "Awaiting administrator review",
    createdAt: new Date().toISOString(),
  };

  store.reports.unshift(newReport);

  if (isAutoVerified && targetComm) {
    applyReportPriceToCommodity(targetComm, Number(reportInput.price));
  }

  addAuditLog(
    "SUBMIT_REPORT",
    `New price report submitted for ${newReport.commodityNameEn} at ${newReport.marketName}: ৳${newReport.price} (${status})`,
    newReport.reporterName || "CITIZEN"
  );

  saveStore();
  return newReport;
};

export const updateReportStatus = (
  id: string,
  status: ReportStatus,
  adminNotes?: string,
  applyPrice = true
) => {
  const store = ensureLoaded();
  const report = store.reports.find((r) => r.id === id);
  if (!report) return null;

  report.status = status;
  report.isVerified = status === "VERIFIED";
  if (adminNotes) report.adminNotes = adminNotes;

  if (status === "VERIFIED" && applyPrice) {
    const targetComm = store.commodities.find((c) => c.id === report.commodityId);
    if (targetComm) {
      applyReportPriceToCommodity(targetComm, report.price);
    }
  }

  addAuditLog(
    "MODERATE_REPORT",
    `Report ${id} marked as ${status} by admin (Market: ${report.marketName}, Price: ৳${report.price})`,
    "ADMIN"
  );

  saveStore();
  return report;
};

export const deleteReport = (id: string) => {
  const store = ensureLoaded();
  const idx = store.reports.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  const [removed] = store.reports.splice(idx, 1);
  addAuditLog("DELETE_REPORT", `Deleted report ${removed.id} for ${removed.commodityNameEn}`, "ADMIN");
  saveStore();
  return true;
};

const applyReportPriceToCommodity = (commodity: Commodity, reportedPrice: number) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const oldPrice = commodity.currentAvgPrice;
  // Weighted blend: 80% current price, 20% crowd verified price
  const newPrice = Math.round(((oldPrice * 4 + reportedPrice) / 5) * 10) / 10;
  commodity.change24h = Math.round(((newPrice - oldPrice) / oldPrice) * 1000) / 10;
  commodity.currentAvgPrice = newPrice;

  const todayIdx = commodity.priceHistory.findIndex((h) => h.date === todayStr);
  if (todayIdx >= 0) {
    commodity.priceHistory[todayIdx].price = newPrice;
  } else {
    commodity.priceHistory.push({ date: todayStr, price: newPrice });
  }
};

// ==========================================
// BULLETINS / ANNOUNCEMENTS
// ==========================================

export const getAllAnnouncements = (activeOnly = false) => {
  const store = ensureLoaded();
  let list = [...store.announcements];
  if (activeOnly) {
    list = list.filter((a) => a.isActive);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createAnnouncement = (input: Omit<Announcement, "id" | "createdAt">) => {
  const store = ensureLoaded();
  const newAnn: Announcement = {
    id: `ann_${Date.now()}`,
    titleEn: input.titleEn,
    titleBn: input.titleBn,
    messageEn: input.messageEn,
    messageBn: input.messageBn,
    level: input.level || "INFO",
    isActive: input.isActive ?? true,
    targetMarket: input.targetMarket || "ALL",
    createdAt: new Date().toISOString(),
  };

  store.announcements.unshift(newAnn);
  addAuditLog("CREATE_ANNOUNCEMENT", `Broadcasted announcement: ${newAnn.titleEn} (${newAnn.level})`, "ADMIN");
  saveStore();
  return newAnn;
};

export const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
  const store = ensureLoaded();
  const ann = store.announcements.find((a) => a.id === id);
  if (!ann) return null;

  Object.assign(ann, updates);
  addAuditLog("UPDATE_ANNOUNCEMENT", `Updated announcement ${id} (Active: ${ann.isActive})`, "ADMIN");
  saveStore();
  return ann;
};

export const deleteAnnouncement = (id: string) => {
  const store = ensureLoaded();
  const idx = store.announcements.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  const [removed] = store.announcements.splice(idx, 1);
  addAuditLog("DELETE_ANNOUNCEMENT", `Deleted announcement: ${removed.titleEn}`, "ADMIN");
  saveStore();
  return true;
};

// ==========================================
// MARKETS MANAGEMENT
// ==========================================

export const getAllMarkets = () => {
  const store = ensureLoaded();
  return [...store.markets];
};

export const createMarket = (input: Omit<MarketHub, "id">) => {
  const store = ensureLoaded();
  const newMarket: MarketHub = {
    id: `mkt_${Date.now()}`,
    name: input.name,
    nameBn: input.nameBn,
    division: input.division,
    district: input.district,
    type: input.type,
    description: input.description,
    status: input.status || "ACTIVE",
  };

  store.markets.unshift(newMarket);
  addAuditLog("CREATE_MARKET", `Added market hub: ${newMarket.name} (${newMarket.division})`, "ADMIN");
  saveStore();
  return newMarket;
};

export const updateMarket = (id: string, updates: Partial<MarketHub>) => {
  const store = ensureLoaded();
  const market = store.markets.find((m) => m.id === id);
  if (!market) return null;

  Object.assign(market, updates);
  addAuditLog("UPDATE_MARKET", `Updated market ${market.name} status: ${market.status}`, "ADMIN");
  saveStore();
  return market;
};

export const deleteMarket = (id: string) => {
  const store = ensureLoaded();
  const idx = store.markets.findIndex((m) => m.id === id);
  if (idx === -1) return false;

  const [removed] = store.markets.splice(idx, 1);
  addAuditLog("DELETE_MARKET", `Deleted market: ${removed.name}`, "ADMIN");
  saveStore();
  return true;
};

// ==========================================
// SYSTEM SETTINGS & AUDIT LOGS
// ==========================================

export const getSystemSettings = (): SystemSettings => {
  const store = ensureLoaded();
  return { ...store.settings };
};

export const updateSystemSettings = (updates: Partial<SystemSettings>): SystemSettings => {
  const store = ensureLoaded();
  store.settings = {
    ...store.settings,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  addAuditLog("UPDATE_SETTINGS", "Updated system global configurations", "ADMIN");
  saveStore();
  return { ...store.settings };
};

export const resetToDefaults = () => {
  memoryStore = buildInitialState();
  saveStore();
  addAuditLog("SYSTEM_RESET", "Reset store to factory defaults", "ADMIN");
  return { success: true };
};

export const getAuditLogs = (limit = 30): AuditLog[] => {
  const store = ensureLoaded();
  return [...store.auditLogs].slice(0, limit);
};

export const addAuditLog = (action: string, details: string, actor = "SYSTEM") => {
  if (!memoryStore) return;
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    actor,
    timestamp: new Date().toISOString(),
  };
  memoryStore.auditLogs.unshift(newLog);
  if (memoryStore.auditLogs.length > 200) {
    memoryStore.auditLogs = memoryStore.auditLogs.slice(0, 200);
  }
};

// ==========================================
// ANALYTICS & ADMIN STATS
// ==========================================

export const getAdminStats = (): AdminStats => {
  const store = ensureLoaded();
  const pending = store.reports.filter((r) => r.status === "PENDING").length;
  const verified = store.reports.filter((r) => r.status === "VERIFIED").length;
  const activeMarkets = store.markets.filter((m) => m.status === "ACTIVE").length;
  const activeBulletins = store.announcements.filter((a) => a.isActive).length;

  const inflations = store.commodities.map((c) => c.change24h);
  const avgInflation =
    inflations.length > 0
      ? Math.round((inflations.reduce((sum, n) => sum + n, 0) / inflations.length) * 10) / 10
      : 0;

  const threshold = store.settings.inflationThresholdPercent || 8;
  const highInflationCount = store.commodities.filter((c) => c.change24h >= threshold).length;

  const latestReport = store.reports[0];

  return {
    totalCommodities: store.commodities.length,
    totalReports: store.reports.length,
    pendingReports: pending,
    verifiedReports: verified,
    activeMarkets,
    activeBulletins,
    avgInflation,
    highInflationCount,
    lastReportTime: latestReport?.createdAt,
  };
};

export const getAnalyticsData = () => {
  const commodities = getAllCommodities();
  const topGainers = [...commodities].sort((a, b) => b.change24h - a.change24h).slice(0, 3);
  const topLosers = [...commodities].sort((a, b) => a.change24h - b.change24h).slice(0, 3);
  const markets = getAllMarkets();

  return {
    totalTracked: commodities.length,
    topGainers,
    topLosers,
    markets,
  };
};
