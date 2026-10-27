"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Commodity, Division, BasketItem, Announcement, SystemSettings } from "../types";
import {
  Language,
  translations,
  formatPrice,
  formatPercent,
  formatRange,
  toBanglaNumber,
} from "../utils/i18n";
import { Sparkline } from "../components/Sparkline";
import { MarketTicker } from "../components/MarketTicker";
import { MarketTable } from "../components/MarketTable";
import { ReportModal } from "../components/ReportModal";
import { BasketModal } from "../components/BasketModal";
import { DetailModal } from "../components/DetailModal";
import { GuideModal } from "../components/GuideModal";
import { MarketCompareModal } from "../components/MarketCompareModal";
import { PrintSlipModal } from "../components/PrintSlipModal";
import { PriceAlertModal } from "../components/PriceAlertModal";
import { BudgetPlannerModal } from "../components/BudgetPlannerModal";
import { TcbTrackerModal } from "../components/TcbTrackerModal";
import { PriceHeatmapModal } from "../components/PriceHeatmapModal";
import { SupplyRadarModal } from "../components/SupplyRadarModal";
import { StorageGuideModal } from "../components/StorageGuideModal";
import { SmartShareModal } from "../components/SmartShareModal";
import { matchesPhoneticQuery } from "../utils/phoneticSearch";
import {
  Search,
  Plus,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Shield,
  Building2,
  RefreshCw,
  Globe2,
  Check,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Calendar,
  HelpCircle,
  Sun,
  Moon,
  ArrowRightLeft,
  Star,
  Bell,
  BellRing,
  Sparkles,
  Truck,
  Map,
  Activity,
  Lightbulb,
  Share2,
} from "lucide-react";

export default function Home() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme: 'light' (Daylight Fresh) or 'dark' (Midnight)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // View Mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selectedDivision, setSelectedDivision] = useState("ALL");
  const [selectedMarketHub, setSelectedMarketHub] = useState("ALL");
  const [sortBy, setSortBy] = useState("default");

  // State
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [lang, setLang] = useState<Language>("bn");
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [basketModalOpen, setBasketModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [printSlipModalOpen, setPrintSlipModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [tcbTrackerModalOpen, setTcbTrackerModalOpen] = useState(false);
  const [heatmapModalOpen, setHeatmapModalOpen] = useState(false);
  const [radarModalOpen, setRadarModalOpen] = useState(false);
  const [storageGuideModalOpen, setStorageGuideModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [triggeredAlertCount, setTriggeredAlertCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [detailCommodity, setDetailCommodity] = useState<Commodity | null>(null);
  const [reportCommodityId, setReportCommodityId] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (commId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(commId) ? prev.filter((id) => id !== commId) : [...prev, commId];
      try {
        localStorage.setItem("bajaardar_favorites", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("bajaardar_theme", nextTheme);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resComm, resAna, resGeo, resAnn, resSet] = await Promise.all([
        fetch("/api/commodities"),
        fetch("/api/commodities/analytics"),
        fetch("/api/geo/divisions"),
        fetch("/api/announcements"),
        fetch("/api/settings"),
      ]);

      const dataComm = await resComm.json();
      const dataAna = await resAna.json();
      const dataGeo = await resGeo.json();
      const dataAnn = await resAnn.json();
      const dataSet = await resSet.json();

      if (dataComm.success) setCommodities(dataComm.data);
      if (dataAna.success) setAnalytics(dataAna.data);
      if (dataGeo.success) setDivisions(dataGeo.data);
      if (dataAnn.success) setAnnouncements(dataAnn.data);
      if (dataSet.success) setSystemSettings(dataSet.data);
    } catch (err) {
      console.error("Failed to load market data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Initialize Theme
    const savedTheme = (localStorage.getItem("bajaardar_theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Initialize Favorites
    try {
      const savedFavs = localStorage.getItem("bajaardar_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error("Failed to parse saved favorites:", e);
    }

    // Show guide on first load if not seen yet
    const hasSeenGuide = localStorage.getItem("bajaardar_onboarded");
    if (!hasSeenGuide) {
      setGuideModalOpen(true);
    }
  }, []);

  // Price Alerts change detector
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bajaardar_price_alerts");
      if (saved && commodities.length > 0) {
        const parsed = JSON.parse(saved);
        setActiveAlertCount(parsed.length);
        const triggered = parsed.filter((alt: any) => {
          const comm = commodities.find((c) => c.id === alt.commodityId);
          return comm && comm.currentAvgPrice <= alt.targetPrice;
        });
        setTriggeredAlertCount(triggered.length);
      } else {
        setActiveAlertCount(0);
        setTriggeredAlertCount(0);
      }
    } catch (e) {}
  }, [commodities, alertModalOpen]);

  // Filtered commodities
  const filteredList = useMemo(() => {
    let list = [...commodities];

    if (category === "WATCHLIST") {
      list = list.filter((c) => favorites.includes(c.id));
    } else if (category !== "ALL") {
      list = list.filter((c) => c.category === category);
    }

    if (search.trim()) {
      list = list.filter((c) =>
        matchesPhoneticQuery(search, c.nameEn, c.nameBn, c.category)
      );
    }

    // Specific Market Hub filter
    if (selectedMarketHub === "KARWAN_BAZAR") {
      // Focus on essential kitchen commodities dominant in Karwan Bazar
      list = list.filter((c) => ["VEGETABLES", "SPICES_OILS", "PROTEIN"].includes(c.category));
    } else if (selectedMarketHub === "KHATUNGANJ") {
      // Khatunganj commodity trading: oils, spices, pulses, rice
      list = list.filter((c) => ["RICE", "SPICES_OILS"].includes(c.category));
    } else if (selectedMarketHub === "SHYAMBAZAR") {
      // Shyambazar: Potato, Onion, Garlic, Ginger
      list = list.filter((c) => ["SPICES_OILS", "VEGETABLES"].includes(c.category));
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.currentAvgPrice - b.currentAvgPrice);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.currentAvgPrice - a.currentAvgPrice);
    } else if (sortBy === "change_desc") {
      list.sort((a, b) => b.change24h - a.change24h);
    } else if (sortBy === "change_asc") {
      list.sort((a, b) => a.change24h - b.change24h);
    }

    return list;
  }, [commodities, category, search, selectedMarketHub, sortBy, favorites]);

  // Basket actions
  const handleAddToBasket = (commodity: Commodity) => {
    setBasket((prev) => {
      const existing = prev.find((item) => item.commodity.id === commodity.id);
      if (existing) {
        return prev.map((item) =>
          item.commodity.id === commodity.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { commodity, quantity: 1 }];
    });
    const itemName = lang === "bn" ? commodity.nameBn : commodity.nameEn;
    showToast(lang === "bn" ? `${itemName} থলেতে যুক্ত হয়েছে!` : `${itemName} added to basket!`);
  };

  const handleBatchAddToBasket = (items: { commodity: Commodity; quantity: number }[]) => {
    setBasket((prev) => {
      let next = [...prev];
      for (const item of items) {
        const idx = next.findIndex((p) => p.commodity.id === item.commodity.id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        } else {
          next.push(item);
        }
      }
      return next;
    });
    showToast(
      lang === "bn"
        ? `${toBanglaNumber(items.length)} টি পণ্য সফলভাবে থলেতে যুক্ত হয়েছে!`
        : `${items.length} items added to basket!`
    );
  };

  const handleUpdateQuantity = (commodityId: string, quantity: number) => {
    setBasket((prev) =>
      prev.map((item) =>
        item.commodity.id === commodityId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromBasket = (commodityId: string) => {
    setBasket((prev) => prev.filter((item) => item.commodity.id !== commodityId));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const topGainer = analytics?.topGainers?.[0];
  const topLoser = analytics?.topLosers?.[0];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. Live Market Ticker Tape */}
      <MarketTicker
        commodities={commodities}
        lang={lang}
        customMessage={lang === "bn" ? systemSettings?.customTickerMessageBn : systemSettings?.customTickerMessageEn}
      />

      {/* 2. Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 150,
            background: "#10b981",
            color: "#ffffff",
            padding: "0.65rem 1.15rem",
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
          }}
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Navigation Bar */}
      <header className="navbar">
        <div className="container nav-inner">
          <a href="#" className="brand">
            <div className="brand-badge">⚖️</div>
            <div>
              <div className="brand-title">{t.brandName}</div>
              <div className="brand-tag">{t.brandSub}</div>
            </div>
          </a>

          <div className="nav-actions">
            {/* Theme Toggle (Daylight / Midnight) */}
            <button
              className="btn btn-theme"
              onClick={toggleTheme}
              title={
                theme === "light"
                  ? lang === "bn"
                    ? "ডার্ক মোড চালু করুন"
                    : "Switch to Dark Mode"
                  : lang === "bn"
                  ? "লাইট মোড চালু করুন"
                  : "Switch to Light Mode"
              }
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Side-by-Side Market Comparison */}
            <button
              className="btn btn-secondary"
              onClick={() => setCompareModalOpen(true)}
              title={t.compareBtn}
              aria-label={t.compareBtn}
            >
              <ArrowRightLeft size={15} style={{ color: "var(--sky)" }} />
              <span className="btn-label">{t.compareBtn}</span>
            </button>

            {/* Target Price Alerts */}
            <button
              className="btn btn-secondary"
              onClick={() => setAlertModalOpen(true)}
              title={t.alertsBtn}
              aria-label={t.alertsBtn}
              style={{ position: "relative" }}
            >
              {triggeredAlertCount > 0 ? (
                <BellRing size={15} style={{ color: "var(--rose)" }} />
              ) : (
                <Bell size={15} style={{ color: "var(--amber)" }} />
              )}
              <span className="btn-label">{t.alertsBtn}</span>
              {activeAlertCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: triggeredAlertCount > 0 ? "var(--rose)" : "var(--amber)",
                    color: "#fff",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {lang === "bn" ? toBanglaNumber(activeAlertCount) : activeAlertCount}
                </span>
              )}
            </button>

            {/* Share / Export */}
            <button
              className="btn btn-secondary"
              onClick={() => setShareModalOpen(true)}
              title={t.shareBtn}
              aria-label={t.shareBtn}
            >
              <Share2 size={15} style={{ color: "var(--emerald)" }} />
              <span className="btn-label">{t.shareBtn}</span>
            </button>

            {/* Help / Guide Button */}
            <button
              className="btn btn-secondary"
              onClick={() => setGuideModalOpen(true)}
              title={t.helpBtn}
              aria-label={t.helpBtn}
            >
              <HelpCircle size={15} style={{ color: "var(--emerald)" }} />
              <span className="btn-label">{t.helpBtn}</span>
            </button>

            {/* Language Switcher */}
            <button
              className="btn btn-secondary"
              onClick={() => setLang((prev) => (prev === "bn" ? "en" : "bn"))}
              title="Toggle Language"
              aria-label="Toggle Language"
            >
              <Globe2 size={15} />
              <span className="btn-label">{t.langToggle}</span>
            </button>

            {/* Report Price Button */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (systemSettings && !systemSettings.crowdsourcingEnabled) {
                  showToast(lang === "bn" ? "প্রশাসনিক কারণে নাগরিক মূল্য রিপোর্টিং সাময়িকভাবে স্থগিত আছে" : "Public price reporting is temporarily paused by admin");
                  return;
                }
                setReportCommodityId("");
                setReportModalOpen(true);
              }}
              title={t.reportBtn}
              aria-label={t.reportBtn}
            >
              <span className="btn-icon">📢</span>
              <span className="btn-label">{t.reportBtn}</span>
            </button>

            {/* Kitchen Basket Button */}
            <button
              className="btn btn-basket"
              onClick={() => setBasketModalOpen(true)}
              title={t.basketBtn}
              aria-label={t.basketBtn}
            >
              <ShoppingBag size={16} />
              <span className="btn-label">{t.basketBtn}</span>
              {basket.length > 0 && (
                <span className="basket-badge">
                  {lang === "bn" ? toBanglaNumber(basket.length) : basket.length}
                </span>
              )}
            </button>

            {/* Admin Console Link */}
            <Link
              href="/admin"
              className="btn btn-secondary"
              style={{
                borderColor: "rgba(16, 185, 129, 0.4)",
                background: "rgba(16, 185, 129, 0.08)",
                color: "var(--emerald)",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
              title={lang === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Console"}
              aria-label={lang === "bn" ? "অ্যাডমিন" : "Admin"}
            >
              <Shield size={14} />
              <span className="btn-label">{lang === "bn" ? "অ্যাডমিন" : "Admin"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 4. Main Body */}
      <main className="container" style={{ flex: 1, paddingBottom: "3rem" }}>
        {/* Live Market Bulletin Banner */}
        {announcements
          .filter((ann) => ann.isActive && !dismissedAnnouncements.includes(ann.id))
          .map((ann) => (
            <div key={ann.id} className={`live-bulletin-banner ${ann.level.toLowerCase()}`}>
              <div className="live-bulletin-inner">
                <span className="live-bulletin-tag">
                  {ann.level === "TCB"
                    ? "🚛 TCB NOTICE"
                    : ann.level === "EMERGENCY"
                    ? "🚨 EMERGENCY"
                    : ann.level === "WARNING"
                    ? "⚠️ ALERT"
                    : "📢 BULLETIN"}
                </span>
                <div className="live-bulletin-text">
                  <strong>{lang === "bn" ? ann.titleBn : ann.titleEn}:</strong>
                  <span>{lang === "bn" ? ann.messageBn : ann.messageEn}</span>
                </div>
              </div>
              <button
                className="live-bulletin-dismiss"
                onClick={() => setDismissedAnnouncements((prev) => [...prev, ann.id])}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          ))}

        {/* Editorial Hero Section */}
        <section className="hero">
          <div className="hero-meta">
            <Calendar size={13} style={{ color: "var(--emerald)" }} />
            <span>{t.updatedDate}</span>
          </div>

          <h1 className="hero-title">
            {t.heroTitlePrefix}{" "}
            <span className="accent">{t.heroTitleHighlight}</span>
          </h1>

          <p className="hero-subtitle">{t.heroSubtitle}</p>

          {/* KPI Metrics Banner */}
          <div className="kpi-grid">
            {/* Top Gainer */}
            <div className="kpi-card">
              <div className="kpi-icon rose">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="kpi-label">{t.topGainerLabel}</div>
                <div className="kpi-val" style={{ color: "#f87171" }}>
                  {topGainer ? (
                    <>
                      {lang === "bn" ? topGainer.nameBn : topGainer.nameEn}{" "}
                      <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                        {formatPercent(topGainer.change24h, lang)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="kpi-sub">
                  {topGainer ? `${formatPrice(topGainer.currentAvgPrice, lang)} / ${lang === "bn" ? topGainer.unitBn : topGainer.unit}` : ""}
                </div>
              </div>
            </div>

            {/* Top Dropper */}
            <div className="kpi-card">
              <div className="kpi-icon emerald">
                <TrendingDown size={20} />
              </div>
              <div>
                <div className="kpi-label">{t.topDropperLabel}</div>
                <div className="kpi-val" style={{ color: "#34d399" }}>
                  {topLoser ? (
                    <>
                      {lang === "bn" ? topLoser.nameBn : topLoser.nameEn}{" "}
                      <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>
                        {formatPercent(topLoser.change24h, lang)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="kpi-sub">
                  {topLoser ? `${formatPrice(topLoser.currentAvgPrice, lang)} / ${lang === "bn" ? topLoser.unitBn : topLoser.unit}` : ""}
                </div>
              </div>
            </div>

            {/* Wholesale Savings Gap */}
            <div className="kpi-card">
              <div className="kpi-icon amber">
                <Building2 size={20} />
              </div>
              <div>
                <div className="kpi-label">{t.wholesaleGapLabel}</div>
                <div className="kpi-val" style={{ color: "#fbbf24" }}>
                  {formatRange(15, 22, lang)}
                </div>
                <div className="kpi-sub">{t.wholesaleGapSub}</div>
              </div>
            </div>

            {/* TCB Regulated Items */}
            <div className="kpi-card">
              <div className="kpi-icon sky">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="kpi-label">{t.tcbLabel}</div>
                <div className="kpi-val" style={{ color: "#38bdf8" }}>
                  {lang === "bn"
                    ? `${toBanglaNumber(commodities.filter((c) => c.tcbPrice).length)} টি পণ্য`
                    : `${commodities.filter((c) => c.tcbPrice).length} Items`}
                </div>
                <div className="kpi-sub">{t.tcbSub}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4.1. Interactive Market Feature & Tools Hub */}
        <section className="feature-hub-section">
          <div className="feature-hub-header">
            <span className="feature-hub-title">
              <Sparkles size={14} style={{ color: "var(--emerald)" }} />
              <span>{lang === "bn" ? "বাজার ফিচার ও স্মার্ট টুলস" : "Market Tools & Intelligence Hub"}</span>
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
              {lang === "bn" ? "৭টি ইন্টারেক্টিভ সুবিধা সক্রিয়" : "7 Interactive Features Active"}
            </span>
          </div>

          <div className="feature-hub-bar">
            {/* 1. Target Price Alerts */}
            <button
              className="feature-hub-btn"
              onClick={() => setAlertModalOpen(true)}
              title={t.alertsBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--amber)" }}>
                {triggeredAlertCount > 0 ? <BellRing size={15} /> : <Bell size={15} />}
              </div>
              <span>{t.alertsBtn}</span>
              {activeAlertCount > 0 ? (
                <span className={`hub-badge ${triggeredAlertCount > 0 ? "rose" : "amber"}`}>
                  {triggeredAlertCount > 0
                    ? lang === "bn"
                      ? "দাম কমেছে!"
                      : "Target Hit!"
                    : lang === "bn"
                    ? toBanglaNumber(activeAlertCount)
                    : activeAlertCount}
                </span>
              ) : (
                <span className="hub-badge" style={{ background: "rgba(245, 158, 11, 0.12)", color: "var(--amber)" }}>
                  {lang === "bn" ? "অ্যালার্ট" : "Alerts"}
                </span>
              )}
            </button>

            {/* 2. Monthly Budget Planner */}
            <button
              className="feature-hub-btn"
              onClick={() => setBudgetModalOpen(true)}
              title={t.budgetBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald)" }}>
                <Sparkles size={15} />
              </div>
              <span>{t.budgetBtn}</span>
              <span className="hub-badge emerald">{lang === "bn" ? "পারিবারিক সাশ্রয়" : "Bulk Save"}</span>
            </button>

            {/* 3. TCB Open-Truck Sales Tracker */}
            <button
              className="feature-hub-btn"
              onClick={() => setTcbTrackerModalOpen(true)}
              title={t.tcbTrackerBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(56, 189, 248, 0.15)", color: "var(--sky)" }}>
                <Truck size={15} />
              </div>
              <span>{t.tcbTrackerBtn}</span>
              <span className="hub-badge" style={{ background: "rgba(56, 189, 248, 0.2)", color: "var(--sky)" }}>
                {lang === "bn" ? "ভর্তুকি সেল" : "Subsidized"}
              </span>
            </button>

            {/* 4. Division Heatmap */}
            <button
              className="feature-hub-btn"
              onClick={() => setHeatmapModalOpen(true)}
              title={t.heatmapBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                <Map size={15} />
              </div>
              <span>{t.heatmapBtn}</span>
              <span className="hub-badge" style={{ background: "rgba(168, 85, 247, 0.2)", color: "#a855f7" }}>
                {lang === "bn" ? "৮ বিভাগ বিস্তার" : "8 Divs"}
              </span>
            </button>

            {/* 5. Supply Radar */}
            <button
              className="feature-hub-btn"
              onClick={() => setRadarModalOpen(true)}
              title={t.radarBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald)" }}>
                <Activity size={15} />
              </div>
              <span>{t.radarBtn}</span>
              <span className="hub-badge emerald">{lang === "bn" ? "পূর্বাভাস" : "Forecast"}</span>
            </button>

            {/* 6. Food Storage & Anti-Waste Tips */}
            <button
              className="feature-hub-btn"
              onClick={() => setStorageGuideModalOpen(true)}
              title={t.tipsBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--amber)" }}>
                <Lightbulb size={15} />
              </div>
              <span>{t.tipsBtn}</span>
              <span className="hub-badge" style={{ background: "rgba(245, 158, 11, 0.2)", color: "var(--amber)" }}>
                {lang === "bn" ? "অপচয় রোধ" : "Tips"}
              </span>
            </button>

            {/* 7. Share & Export CSV */}
            <button
              className="feature-hub-btn"
              onClick={() => setShareModalOpen(true)}
              title={t.shareBtn}
            >
              <div className="hub-icon-wrap" style={{ background: "rgba(2, 132, 199, 0.15)", color: "var(--sky)" }}>
                <Share2 size={15} />
              </div>
              <span>{t.shareBtn}</span>
              <span className="hub-badge" style={{ background: "rgba(2, 132, 199, 0.2)", color: "var(--sky)" }}>
                WhatsApp / CSV
              </span>
            </button>
          </div>
        </section>

        {/* Filter and Control Toolbar */}
        <section className="filter-toolbar">
          <div className="toolbar-primary">
            {/* Search Input */}
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Division Selector */}
            <select
              className="select-dropdown"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="ALL">🏛️ {t.allDivisions}</option>
              {divisions.map((d) => (
                <option key={d.name} value={d.name}>
                  {lang === "bn" ? d.bnName : d.name} {t.divisionSuffix}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              className="select-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">{t.defaultSort}</option>
              <option value="price_asc">{t.sortPriceAsc}</option>
              <option value="price_desc">{t.sortPriceDesc}</option>
              <option value="change_desc">{t.sortChangeDesc}</option>
              <option value="change_asc">{t.sortChangeAsc}</option>
            </select>

            {/* View Mode Toggle (Cards vs Table) */}
            <div className="view-mode-group">
              <button
                type="button"
                className={`view-btn ${viewMode === "cards" ? "active" : ""}`}
                onClick={() => setViewMode("cards")}
                title={t.viewCards}
              >
                <LayoutGrid size={15} />
                <span>{t.viewCards}</span>
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title={t.viewTable}
              >
                <TableIcon size={15} />
                <span>{t.viewTable}</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              className="btn btn-secondary"
              onClick={fetchData}
              title="Refresh Live Data"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Quick Hub Filter Bar */}
          <div className="hub-pills">
            <button
              className={`hub-btn ${category === "ALL" && selectedMarketHub === "ALL" ? "active" : ""}`}
              onClick={() => {
                setCategory("ALL");
                setSelectedMarketHub("ALL");
              }}
            >
              <span>🛒</span>
              <span>{t.categories.ALL}</span>
            </button>

            {/* Watchlist Tab */}
            <button
              className={`hub-btn ${category === "WATCHLIST" ? "active" : ""}`}
              onClick={() => {
                setCategory("WATCHLIST");
                setSelectedMarketHub("ALL");
              }}
            >
              <Star size={13} color="#f59e0b" fill={category === "WATCHLIST" ? "#f59e0b" : "none"} />
              <span>{t.watchlistTab}</span>
              {favorites.length > 0 && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(245, 158, 11, 0.2)",
                    color: "#f59e0b",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    fontWeight: 700,
                  }}
                >
                  {lang === "bn" ? toBanglaNumber(favorites.length) : favorites.length}
                </span>
              )}
            </button>

            <button
              className={`hub-btn ${category === "RICE" ? "active" : ""}`}
              onClick={() => setCategory("RICE")}
            >
              <span>🌾</span>
              <span>{t.categories.RICE}</span>
            </button>

            <button
              className={`hub-btn ${category === "VEGETABLES" ? "active" : ""}`}
              onClick={() => setCategory("VEGETABLES")}
            >
              <span>🥬</span>
              <span>{t.categories.VEGETABLES}</span>
            </button>

            <button
              className={`hub-btn ${category === "SPICES_OILS" ? "active" : ""}`}
              onClick={() => setCategory("SPICES_OILS")}
            >
              <span>🧅</span>
              <span>{t.categories.SPICES_OILS}</span>
            </button>

            <button
              className={`hub-btn ${category === "PROTEIN" ? "active" : ""}`}
              onClick={() => setCategory("PROTEIN")}
            >
              <span>🍗</span>
              <span>{t.categories.PROTEIN}</span>
            </button>

            {/* Real Hub Filters */}
            <span style={{ color: "var(--border)", alignSelf: "center", padding: "0 4px" }}>|</span>

            <button
              className={`hub-btn ${selectedMarketHub === "KARWAN_BAZAR" ? "active" : ""}`}
              onClick={() => setSelectedMarketHub(selectedMarketHub === "KARWAN_BAZAR" ? "ALL" : "KARWAN_BAZAR")}
            >
              <MapPin size={12} color="#38bdf8" />
              <span>{t.karwanBazar}</span>
            </button>

            <button
              className={`hub-btn ${selectedMarketHub === "SHYAMBAZAR" ? "active" : ""}`}
              onClick={() => setSelectedMarketHub(selectedMarketHub === "SHYAMBAZAR" ? "ALL" : "SHYAMBAZAR")}
            >
              <MapPin size={12} color="#fbbf24" />
              <span>{t.shyamBazar}</span>
            </button>

            <button
              className={`hub-btn ${selectedMarketHub === "KHATUNGANJ" ? "active" : ""}`}
              onClick={() => setSelectedMarketHub(selectedMarketHub === "KHATUNGANJ" ? "ALL" : "KHATUNGANJ")}
            >
              <MapPin size={12} color="#34d399" />
              <span>{t.khatunganj}</span>
            </button>
          </div>
        </section>

        {/* Content Display: Cards View or Table View */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: "0 auto 0.75rem", color: "var(--emerald)" }} />
            <p style={{ fontSize: "1rem", fontWeight: 600 }}>{t.loadingText}</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>
              {category === "WATCHLIST" ? "⭐" : "🔍"}
            </span>
            <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.25rem" }}>
              {category === "WATCHLIST" ? t.watchlistEmpty : t.emptySearch}
            </p>
            {category !== "WATCHLIST" && <p style={{ fontSize: "0.82rem" }}>{t.emptySearchSub}</p>}
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <MarketTable
            commodities={filteredList}
            lang={lang}
            onAddToBasket={handleAddToBasket}
            onOpenDetails={(c) => setDetailCommodity(c)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          /* Cards Grid View */
          <div className="commodity-grid">
            {filteredList.map((comm) => {
              const isUp = comm.change24h > 0;
              const isDown = comm.change24h < 0;
              const name = lang === "bn" ? comm.nameBn : comm.nameEn;
              const subName = lang === "bn" ? comm.nameEn : comm.nameBn;
              const unit = lang === "bn" ? comm.unitBn : comm.unit;

              return (
                <div className="card" key={comm.id}>
                  {/* Top Bar */}
                  <div className="card-top">
                    <div className="card-title-group">
                      <div className="card-icon">{comm.icon}</div>
                      <div>
                        <div className="card-name-primary">{name}</div>
                        <div className="card-name-sub">{subName}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <button
                        type="button"
                        className={`star-btn ${favorites.includes(comm.id) ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(comm.id);
                        }}
                        title={
                          favorites.includes(comm.id)
                            ? lang === "bn"
                              ? "পছন্দ থেকে সরান"
                              : "Remove from favorites"
                            : lang === "bn"
                            ? "পছন্দে যোগ করুন"
                            : "Add to favorites"
                        }
                      >
                        <Star size={16} fill={favorites.includes(comm.id) ? "currentColor" : "none"} />
                      </button>

                      <div
                        className={`delta-pill ${
                          isUp ? "up" : isDown ? "down" : "neutral"
                        }`}
                      >
                        {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : null}
                        <span>{formatPercent(comm.change24h, lang)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supply Status Pill */}
                  {comm.supplyStatus && (
                    <div style={{ marginTop: "0.25rem", marginBottom: "0.45rem" }}>
                      <span
                        className={`status-pill ${
                          comm.supplyStatus === "IN_STOCK"
                            ? "in-stock"
                            : comm.supplyStatus === "MODERATE"
                            ? "moderate"
                            : "scarce"
                        }`}
                        style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
                      >
                        {comm.supplyStatus === "IN_STOCK"
                          ? lang === "bn"
                            ? "🟢 পর্যাপ্ত সরবরাহ"
                            : "● Plentiful Supply"
                          : comm.supplyStatus === "MODERATE"
                          ? lang === "bn"
                            ? "🟡 স্বাভাবিক সরবরাহ"
                            : "● Moderate Supply"
                          : lang === "bn"
                          ? "🔴 সংকট / সীমিত সরবরাহ"
                          : "● Scarce Supply"}
                      </span>
                    </div>
                  )}

                  {/* Prices Display */}
                  <div className="card-prices">
                    <div>
                      <div className="price-item-label">{t.retailPrice}</div>
                      <div className="price-item-val">
                        {formatPrice(comm.currentAvgPrice, lang)}
                        <span className="price-item-unit">/{unit}</span>
                      </div>
                    </div>

                    <div>
                      <div className="price-item-label" style={{ color: "#38bdf8" }}>
                        {t.wholesalePrice}
                      </div>
                      <div className="price-item-val" style={{ color: "#38bdf8" }}>
                        {formatPrice(comm.wholesalePrice, lang)}
                        <span className="price-item-unit">/{unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* TCB Badge if present */}
                  {comm.tcbPrice && (
                    <div className="tcb-bar">
                      <span>{t.tcbTag}</span>
                      <span style={{ fontWeight: 800 }}>
                        {formatPrice(comm.tcbPrice, lang)} /{unit}
                      </span>
                    </div>
                  )}

                  {/* 7-Day Sparkline */}
                  <div className="sparkline-wrap">
                    <Sparkline
                      data={comm.priceHistory}
                      height={40}
                      isPositiveChange={comm.change24h > 0}
                    />
                  </div>

                  {/* Card Actions */}
                  <div className="card-footer">
                    <button
                      className="card-btn card-btn-basket"
                      onClick={() => handleAddToBasket(comm)}
                    >
                      <Plus size={13} />
                      <span>{t.addToBasket}</span>
                    </button>

                    <button
                      className="card-btn card-btn-detail"
                      onClick={() => setDetailCommodity(comm)}
                    >
                      <Eye size={13} />
                      <span>{t.details}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. Clean Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", marginBottom: "3px" }}>
              {t.brandName} • {t.brandSub}
            </div>
            <p style={{ maxWidth: "520px", fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
              {t.footerText}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--emerald)", fontSize: "0.78rem", fontWeight: 600 }}>
              <span className="ticker-dot"></span>
              {t.footerLive}
            </span>
            <span style={{ color: "var(--border)" }}>•</span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Next.js & Express MERN
            </span>
          </div>
        </div>
      </footer>

      {/* 6. Modals */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        commodities={commodities}
        divisions={divisions}
        selectedCommodityId={reportCommodityId}
        onSuccess={() => {
          showToast(
            lang === "bn" ? "নতুন দর তালিকায় যুক্ত হয়েছে!" : "Price report submitted to index!"
          );
          fetchData();
        }}
        lang={lang}
      />

      <BasketModal
        isOpen={basketModalOpen}
        onClose={() => setBasketModalOpen(false)}
        basket={basket}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromBasket}
        onClearBasket={handleClearBasket}
        onOpenPrintSlip={() => setPrintSlipModalOpen(true)}
        lang={lang}
      />

      <MarketCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        commodities={commodities}
        lang={lang}
      />

      <PrintSlipModal
        isOpen={printSlipModalOpen}
        onClose={() => setPrintSlipModalOpen(false)}
        basket={basket}
        calcResult={null}
        lang={lang}
      />

      <DetailModal
        commodity={detailCommodity}
        onClose={() => setDetailCommodity(null)}
        onOpenReport={(commId) => {
          setReportCommodityId(commId);
          setReportModalOpen(true);
        }}
        onAddToBasket={handleAddToBasket}
        lang={lang}
      />

      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        lang={lang}
      />

      <PriceAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        commodities={commodities}
        lang={lang}
        onAlertTriggered={(msg) => showToast(msg)}
      />

      <BudgetPlannerModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        commodities={commodities}
        lang={lang}
        onAddMultipleToBasket={handleBatchAddToBasket}
      />

      <TcbTrackerModal
        isOpen={tcbTrackerModalOpen}
        onClose={() => setTcbTrackerModalOpen(false)}
        lang={lang}
      />

      <PriceHeatmapModal
        isOpen={heatmapModalOpen}
        onClose={() => setHeatmapModalOpen(false)}
        commodities={commodities}
        lang={lang}
      />

      <SupplyRadarModal
        isOpen={radarModalOpen}
        onClose={() => setRadarModalOpen(false)}
        commodities={commodities}
        lang={lang}
      />

      <StorageGuideModal
        isOpen={storageGuideModalOpen}
        onClose={() => setStorageGuideModalOpen(false)}
        lang={lang}
      />

      <SmartShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        commodities={commodities}
        lang={lang}
      />
    </div>
  );
}
