"use client";

import React, { useState } from "react";
import { Commodity } from "../types";
import { Language, formatPrice, toBanglaNumber } from "../utils/i18n";
import { X, Map, TrendingUp, TrendingDown, Truck, Info, CheckCircle2 } from "lucide-react";

interface DivisionPriceInfo {
  divisionBn: string;
  divisionEn: string;
  priceFactor: number; // relative to national avg
  transportNoteBn: string;
  transportNoteEn: string;
}

const DIVISIONS_CONFIG: DivisionPriceInfo[] = [
  { divisionBn: "ঢাকা", divisionEn: "Dhaka", priceFactor: 1.05, transportNoteBn: "কাওরান বাজার পাইকারি মোকাম ও উচ্চ পরিবহন ব্যয়", transportNoteEn: "Major consumption terminal hub & urban transport markup" },
  { divisionBn: "চট্টগ্রাম", divisionEn: "Chittagong", priceFactor: 1.07, transportNoteBn: "খাতুনগঞ্জ মোকাম ও দূরবর্তী সরবরাহ পরিবহন", transportNoteEn: "Khatunganj hub with coastal logistics freight costs" },
  { divisionBn: "রাজশাহী", divisionEn: "Rajshahi", priceFactor: 0.92, transportNoteBn: "উৎপাদন অঞ্চল (বগুড়া ও নাটোর কৃষিপণ্য সরবরাহ)", transportNoteEn: "Direct agricultural producing zone (Bogura/Natore corridor)" },
  { divisionBn: "রংপুর", divisionEn: "Rangpur", priceFactor: 0.88, transportNoteBn: "উত্তরবঙ্গের মূল আলু ও শাকসবজি উৎপাদন কেন্দ্র", transportNoteEn: "Primary northern vegetable & potato cultivation belt" },
  { divisionBn: "খুলনা", divisionEn: "Khulna", priceFactor: 0.96, transportNoteBn: "দক্ষিণ-পশ্চিমাঞ্চল ও বেনাপোল বন্দর আমদানি সুবিধা", transportNoteEn: "Southwestern hub with Benapole port import access" },
  { divisionBn: "বরিশাল", divisionEn: "Barishal", priceFactor: 1.02, transportNoteBn: "নদী ও উপকূলীয় পরিবহন নির্ভর সরবরাহ", transportNoteEn: "Riverine & coastal logistics dependent pricing" },
  { divisionBn: "সিলেট", divisionEn: "Sylhet", priceFactor: 1.06, transportNoteBn: "পাহাড়ি এলাকা ও দীর্ঘ দূরত্বে পরিবহন খরচ", transportNoteEn: "Long-haul highway freight from western producing zones" },
  { divisionBn: "ময়মনসিংহ", divisionEn: "Mymensingh", priceFactor: 0.94, transportNoteBn: "নিকটবর্তী কৃষি ও পোল্ট্রি উৎপাদন কেন্দ্র", transportNoteEn: "Close proximity poultry and agricultural farming zone" },
];

interface PriceHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  lang: Language;
}

export const PriceHeatmapModal: React.FC<PriceHeatmapModalProps> = ({
  isOpen,
  onClose,
  commodities,
  lang,
}) => {
  const [selectedId, setSelectedId] = useState<string>(commodities[0]?.id || "");

  if (!isOpen) return null;

  const selectedComm = commodities.find((c) => c.id === selectedId) || commodities[0];
  if (!selectedComm) return null;

  const basePrice = selectedComm.currentAvgPrice;
  const unit = lang === "bn" ? selectedComm.unitBn : selectedComm.unit;

  // Calculate divisional prices
  const divData = DIVISIONS_CONFIG.map((d) => {
    const price = Math.round(basePrice * d.priceFactor);
    const diff = price - basePrice;
    return {
      ...d,
      price,
      diff,
    };
  }).sort((a, b) => a.price - b.price);

  const lowest = divData[0];
  const highest = divData[divData.length - 1];
  const priceSpread = highest.price - lowest.price;

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
              <Map size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "বাংলাদেশ বিভাগীয় মূল্য তারতম্য ও হিটম্যাপ" : "Divisional Price Variance Heatmap"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "উৎপাদন অঞ্চল থেকে রাজধানী পর্যন্ত পরিবহন ব্যয় ও মূল্যের ব্যবধান"
                  : "Price variance from farm gates to urban terminals across all 8 divisions"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Commodity Selector Pills */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 700 }}>
            {lang === "bn" ? "পণ্য নির্বাচন করুন:" : "Select Commodity:"}
          </label>
          <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "0.4rem" }}>
            {commodities.slice(0, 10).map((c) => (
              <button
                key={c.id}
                className={`btn ${selectedId === c.id ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem", whiteSpace: "nowrap" }}
                onClick={() => setSelectedId(c.id)}
              >
                <span>{c.icon}</span>
                <span>{lang === "bn" ? c.nameBn : c.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Commodity Highlight & National Price Spread */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            marginBottom: "1.2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {/* National Avg */}
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
              {lang === "bn" ? "জাতীয় গড় মূল্য" : "National Average"}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
              {formatPrice(basePrice, lang)}/{unit}
            </div>
          </div>

          {/* Lowest Division */}
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--emerald)", fontWeight: 700 }}>
              <TrendingDown size={12} style={{ display: "inline", marginRight: "3px" }} />
              {lang === "bn" ? "সর্বনিম্ন দর অঞ্চল" : "Cheapest Division"}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--emerald)", marginTop: "2px" }}>
              {formatPrice(lowest.price, lang)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {lang === "bn" ? lowest.divisionBn : lowest.divisionEn} (উৎপাদন বলয়)
            </div>
          </div>

          {/* Highest Division */}
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--rose)", fontWeight: 700 }}>
              <TrendingUp size={12} style={{ display: "inline", marginRight: "3px" }} />
              {lang === "bn" ? "সর্বোচ্চ দর অঞ্চল" : "Highest Division"}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--rose)", marginTop: "2px" }}>
              {formatPrice(highest.price, lang)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {lang === "bn" ? highest.divisionBn : highest.divisionEn} (ভোগ্য হাব)
            </div>
          </div>

          {/* Transport Spread */}
          <div>
            <div style={{ fontSize: "0.68rem", color: "var(--amber)", fontWeight: 700 }}>
              <Truck size={12} style={{ display: "inline", marginRight: "3px" }} />
              {lang === "bn" ? "পরিবহন বিস্তার" : "Logistics Spread"}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--amber)", marginTop: "2px" }}>
              +{formatPrice(priceSpread, lang)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {lang === "bn"
                ? `~${toBanglaNumber(Math.round((priceSpread / lowest.price) * 100))}% ব্যবধান`
                : `~${Math.round((priceSpread / lowest.price) * 100)}% gap`}
            </div>
          </div>
        </div>

        {/* Division Heatmap Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "0.65rem",
            marginBottom: "1rem",
            maxHeight: "280px",
            overflowY: "auto",
          }}
        >
          {divData.map((d) => {
            const isLowest = d.divisionEn === lowest.divisionEn;
            const isHighest = d.divisionEn === highest.divisionEn;
            const badgeColor = isLowest ? "var(--emerald)" : isHighest ? "var(--rose)" : "var(--amber)";

            return (
              <div
                key={d.divisionEn}
                style={{
                  background: isLowest
                    ? "rgba(16, 185, 129, 0.08)"
                    : isHighest
                    ? "rgba(225, 29, 72, 0.08)"
                    : "var(--bg-surface)",
                  border: `1px solid ${isLowest ? "var(--emerald)" : isHighest ? "var(--rose)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {lang === "bn" ? d.divisionBn : d.divisionEn}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-full)",
                      background: `${badgeColor}22`,
                      color: badgeColor,
                    }}
                  >
                    {isLowest
                      ? lang === "bn" ? "সবচেয়ে কম" : "Cheapest"
                      : isHighest
                      ? lang === "bn" ? "সবচেয়ে বেশি" : "Highest"
                      : d.diff > 0
                      ? `+${d.diff}`
                      : `${d.diff}`}
                  </span>
                </div>

                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {formatPrice(d.price, lang)}
                  <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginLeft: "3px" }}>
                    /{unit}
                  </span>
                </div>

                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.35rem", lineHeight: 1.3 }}>
                  {lang === "bn" ? d.transportNoteBn : d.transportNoteEn}
                </div>
              </div>
            );
          })}
        </div>

        {/* Educational Note */}
        <div
          style={{
            background: "rgba(2, 132, 199, 0.08)",
            border: "1px solid rgba(2, 132, 199, 0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "0.65rem 0.85rem",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}
        >
          <Info size={16} style={{ color: "var(--sky)", flexShrink: 0, marginTop: "2px" }} />
          <span>
            {lang === "bn"
              ? "কৃষক পর্যায়ে উৎপাদন এলাকার (বগুড়া, রংপুর, যশোর) মূল্যের সাথে ঢাকার পাইকারি আড়ত ও খুচরা বাজারের পার্থক্যের প্রধান কারণ: ট্রাক পরিবহন ভাড়া, জ্বালানি তেল, ঘাটতি/পচন ক্ষতি ও মোকামের লেবার হ্যান্ডলিং।"
              : "Price differences between primary farming regions (Bogura, Rangpur, Jashore) and terminal retail markets like Dhaka stem from freight truck fuel costs, transit perishability, and handling tolls."}
          </span>
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
