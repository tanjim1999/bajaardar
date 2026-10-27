"use client";

import React from "react";
import { Commodity } from "../types";
import { Language, toBanglaNumber } from "../utils/i18n";
import { X, Activity, Ship, Truck, ThermometerSnowflake, Sprout, ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from "lucide-react";

interface SupplyIndicator {
  titleBn: string;
  titleEn: string;
  statusBn: string;
  statusEn: string;
  health: "EXCELLENT" | "NORMAL" | "WATCH";
  detailBn: string;
  detailEn: string;
  icon: React.ReactNode;
}

const INDICATORS: SupplyIndicator[] = [
  {
    titleBn: "স্থলবন্দর আমদানি প্রবাহ (বেনাপোল, হিলি ও সোনামসজিদ)",
    titleEn: "Land Port Import Inflow (Benapole, Hili, Sonamasjid)",
    statusBn: "স্বাভাবিক (দৈনিক ১৫০+ ট্রাক)",
    statusEn: "Normal (150+ trucks/day)",
    health: "EXCELLENT",
    detailBn: "ভারত থেকে পেঁয়াজ, রসুন ও আদার আমদানি শুল্ক ছাড় পাওয়ায় সরবরাহ নির্বিঘ্ন রয়েছে।",
    detailEn: "Import tariff concessions on onions and garlic maintain steady border crossings.",
    icon: <Ship size={18} style={{ color: "var(--sky)" }} />,
  },
  {
    titleBn: "জাতীয় মহাসড়ক ও সেতু করিডোর ট্রানজিট",
    titleEn: "National Highway & Bridge Logistics Corridors",
    statusBn: "সম্পূর্ণ সচল ও যানজটমুক্ত",
    statusEn: "Smooth & Uncongested",
    health: "EXCELLENT",
    detailBn: "পদ্মা সেতু ও বঙ্গবন্ধু সেতু রুটে শাকসবজি বহনকারী কাভার্ড ভ্যান দ্রুত ঢাকায় পৌঁছাচ্ছে।",
    detailEn: "Vegetable consignments from south & north corridors reaching Karwan Bazar on time.",
    icon: <Truck size={18} style={{ color: "var(--emerald)" }} />,
  },
  {
    titleBn: "হিমাগার থেকে আলু খালাস ও মজুদ পরিস্থিতি",
    titleEn: "Cold Storage Release & Stock Inventory",
    statusBn: "পর্যাপ্ত মজুদ ও নিয়মিত খালাস",
    statusEn: "Adequate Stock Released",
    health: "NORMAL",
    detailBn: "বগুড়া ও মুন্সিগঞ্জের কোল্ড স্টোরেজ থেকে দৈনিক কোটা অনুযায়ী আলু স্থানীয় মোকামে খালাস হচ্ছে।",
    detailEn: "Daily scheduled releases from Bogura and Munshiganj storages keeping prices tempered.",
    icon: <ThermometerSnowflake size={18} style={{ color: "var(--sky)" }} />,
  },
  {
    titleBn: "শীতকালীন আগাম সবজি ফসল উত্তোলন",
    titleEn: "Winter Early Crop Harvest Yields",
    statusBn: "উচ্চ সরবরাহ (ইনফ্লো +২৪%)",
    statusEn: "High Inflow (+24% volume)",
    health: "EXCELLENT",
    detailBn: "যশোর, মেহেরপুর ও নরসিংদী থেকে ফুলকপি, বাঁধাকপি ও শিমের ব্যাপক পাইকারি সরবরাহ শুরু হয়েছে।",
    detailEn: "Heavy consignments of cauliflower, cabbage, and beans reducing wholesale auction pressure.",
    icon: <Sprout size={18} style={{ color: "var(--emerald)" }} />,
  },
];

interface SupplyRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  lang: Language;
}

export const SupplyRadarModal: React.FC<SupplyRadarModalProps> = ({
  isOpen,
  onClose,
  commodities,
  lang,
}) => {
  if (!isOpen) return null;

  // Determine market trajectory for key commodities
  const forecastList = commodities.slice(0, 8).map((c) => {
    let trajectory: "UP" | "DOWN" | "STABLE" = "STABLE";
    let reasonBn = "সরবরাহ ও চাহিদা সমতায় রয়েছে";
    let reasonEn = "Supply and demand balanced";

    if (c.category === "VEGETABLES") {
      trajectory = "DOWN";
      reasonBn = "শীতকালীন ফসলের অতিরিক্ত সরবরাহে দর কমতির দিকে";
      reasonEn = "Heavy winter harvest influx driving prices down";
    } else if (c.category === "PROTEIN") {
      trajectory = "UP";
      reasonBn = "পোল্ট্রি ফিড ও পরিবহন ব্যয়ের প্রভাবে দর সামান্য বাড়তে পারে";
      reasonEn = "Feed and transport overhead exerting upward pressure";
    } else if (c.category === "SPICES_OILS") {
      trajectory = "STABLE";
      reasonBn = "আমদানি শুল্ক ছাড়ের কারণে আন্তর্জাতিক বাজার স্থিতিশীল";
      reasonEn = "Import duty relief keeping wholesale rates stable";
    }

    return {
      commodity: c,
      trajectory,
      reasonBn,
      reasonEn,
    };
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "780px", width: "95%" }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--emerald)",
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "বাজার সরবরাহ ও লজিস্টিকস পূর্বাভাস রাডার" : "Supply Chain & Logistics Radar"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "আমদানি বন্দর, মহাসড়ক পরিবহন ও আগামী ৭ দিনের মূল্যের গতিপথ"
                  : "Port imports, highway transport, and 7-day commodity price trajectories"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Overall Health Gauge Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(56, 189, 248, 0.1))",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "0.9rem 1.1rem",
            marginBottom: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.74rem", color: "var(--emerald)", fontWeight: 700, textTransform: "uppercase" }}>
              {lang === "bn" ? "সার্বিক বাজার স্থিতিশীলতা সূচক" : "Overall Market Stability Index"}
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
              {lang === "bn" ? `${toBanglaNumber(86)}/১০০` : "86/100"} —{" "}
              <span style={{ color: "var(--emerald)" }}>{lang === "bn" ? "স্বাভাবিক ও স্থিতিশীল" : "Stable & Healthy"}</span>
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {lang === "bn"
                ? "শীতকালীন ফসলের প্রাচুর্য ও আমদানির কারণে কোনো জরুরি ঘাটতির ঝুঁকি নেই।"
                : "No critical scarcity detected. Seasonal crop arrival keeping supplies steady."}
            </div>
          </div>

          <div
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(16, 185, 129, 0.2)",
              color: "var(--emerald)",
              fontWeight: 800,
              fontSize: "0.82rem",
              textAlign: "center",
            }}
          >
            ● {lang === "bn" ? "ঘাটতি ঝুঁকি: শূন্য" : "Scarcity Risk: LOW"}
          </div>
        </div>

        {/* 4 Key Supply Channels */}
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.6rem" }}>
            {lang === "bn" ? "মূল সরবরাহ চ্যানেল ও লজিস্টিকস মনিটরিং" : "Key Inflow Channels & Transport Health"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.65rem" }}>
            {INDICATORS.map((ind, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  {ind.icon}
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-main)", flex: 1 }}>
                    {lang === "bn" ? ind.titleBn : ind.titleEn}
                  </div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--emerald)", fontWeight: 700, marginBottom: "0.25rem" }}>
                  ● {lang === "bn" ? ind.statusBn : ind.statusEn}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
                  {lang === "bn" ? ind.detailBn : ind.detailEn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Trajectory Forecast Table */}
        <div>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
            {lang === "bn" ? "আগামী ৭ দিনের সম্ভাব্য মূল্যের গতিপথ (পূর্বাভাস)" : "7-Day Projected Price Trajectory"}
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", maxHeight: "200px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.76rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.45rem 0.65rem" }}>{lang === "bn" ? "পণ্য" : "Item"}</th>
                  <th style={{ padding: "0.45rem" }}>{lang === "bn" ? "গতিপথ" : "Trajectory"}</th>
                  <th style={{ padding: "0.45rem 0.65rem" }}>{lang === "bn" ? "যুক্তিসংগত কারণ" : "Market Driver"}</th>
                </tr>
              </thead>
              <tbody>
                {forecastList.map((f) => {
                  const name = lang === "bn" ? f.commodity.nameBn : f.commodity.nameEn;
                  const isDown = f.trajectory === "DOWN";
                  const isUp = f.trajectory === "UP";
                  const color = isDown ? "var(--emerald)" : isUp ? "var(--rose)" : "var(--amber)";

                  return (
                    <tr key={f.commodity.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.45rem 0.65rem", fontWeight: 700, color: "var(--text-main)" }}>
                        <span style={{ marginRight: "5px" }}>{f.commodity.icon}</span>
                        {name}
                      </td>
                      <td style={{ padding: "0.45rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.2rem",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "var(--radius-full)",
                            background: `${color}22`,
                            color: color,
                          }}
                        >
                          {isDown ? (
                            <>
                              <ArrowDownRight size={13} />
                              {lang === "bn" ? "নিম্নমুখী (কমবে)" : "Falling ↘"}
                            </>
                          ) : isUp ? (
                            <>
                              <ArrowUpRight size={13} />
                              {lang === "bn" ? "উর্ধ্বমুখী (বাড়বে)" : "Rising ↗"}
                            </>
                          ) : (
                            <>
                              <Minus size={13} />
                              {lang === "bn" ? "স্থিতিশীল" : "Stable →"}
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: "0.45rem 0.65rem", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                        {lang === "bn" ? f.reasonBn : f.reasonEn}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
