"use client";

import React, { useState } from "react";
import { Language, formatPrice, toBanglaNumber } from "../utils/i18n";
import { X, Truck, ShieldCheck, MapPin, Clock, Search, ExternalLink, AlertTriangle, Users } from "lucide-react";

interface TcbTruckPoint {
  id: string;
  nameBn: string;
  nameEn: string;
  areaBn: string;
  areaEn: string;
  division: string;
  district: string;
  timing: string;
  quotaPerDay: number;
  status: "ACTIVE" | "CROWDED" | "RESTOCKING";
}

const TCB_POINTS: TcbTruckPoint[] = [
  {
    id: "tcb_1",
    nameBn: "টিসিবি ভবন চত্বর, কাওরান বাজার",
    nameEn: "TCB Bhaban Square, Karwan Bazar",
    areaBn: "কাওরান বাজার, ঢাকা",
    areaEn: "Karwan Bazar, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    timing: "9:30 AM - 4:00 PM",
    quotaPerDay: 400,
    status: "ACTIVE",
  },
  {
    id: "tcb_2",
    nameBn: "জাতীয় প্রেস ক্লাব চত্বর",
    nameEn: "National Press Club Square",
    areaBn: "তোপখানা রোড, পল্টন",
    areaEn: "Topkhana Road, Paltan",
    division: "Dhaka",
    district: "Dhaka",
    timing: "9:30 AM - 4:00 PM",
    quotaPerDay: 350,
    status: "CROWDED",
  },
  {
    id: "tcb_3",
    nameBn: "ফার্মগেট মোড় (আনন্দ সিনেমা সংলগ্ন)",
    nameEn: "Farmgate Intersection (Near Ananda Cinema)",
    areaBn: "ফার্মগেট, ঢাকা",
    areaEn: "Farmgate, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    timing: "9:30 AM - 3:30 PM",
    quotaPerDay: 300,
    status: "ACTIVE",
  },
  {
    id: "tcb_4",
    nameBn: "মিরপুর-১০ গোলচত্বর ফায়ার সার্ভিস মোড়",
    nameEn: "Mirpur-10 Fire Station Point",
    areaBn: "মিরপুর, ঢাকা",
    areaEn: "Mirpur, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    timing: "9:30 AM - 4:00 PM",
    quotaPerDay: 350,
    status: "ACTIVE",
  },
  {
    id: "tcb_5",
    nameBn: "মতিঝিল শাপলা চত্বর",
    nameEn: "Motijheel Shapla Chattar",
    areaBn: "মতিঝিল বাণিজ্যিক এলাকা",
    areaEn: "Motijheel C/A",
    division: "Dhaka",
    district: "Dhaka",
    timing: "9:30 AM - 4:00 PM",
    quotaPerDay: 300,
    status: "ACTIVE",
  },
  {
    id: "tcb_6",
    nameBn: "উত্তরা আজমপুর বাসস্ট্যান্ড মোড়",
    nameEn: "Uttara Azampur Bus Stand Point",
    areaBn: "সেক্টর ৭, উত্তরা",
    areaEn: "Sector 7, Uttara",
    division: "Dhaka",
    district: "Dhaka",
    timing: "10:00 AM - 4:00 PM",
    quotaPerDay: 300,
    status: "RESTOCKING",
  },
  {
    id: "tcb_7",
    nameBn: "ধানমন্ডি ৩২ (সোবহানবাগ মসজিদ পয়েন্ট)",
    nameEn: "Dhanmondi 32 (Sobhanbagh Point)",
    areaBn: "ধানমন্ডি, ঢাকা",
    areaEn: "Dhanmondi, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    timing: "9:30 AM - 3:30 PM",
    quotaPerDay: 300,
    status: "ACTIVE",
  },
  {
    id: "tcb_8",
    nameBn: "চট্টগ্রাম আগ্রাবাদ বাদামতলী মোড়",
    nameEn: "Agrabad Badamtali Square, Chittagong",
    areaBn: "আগ্রাবাদ, চট্টগ্রাম",
    areaEn: "Agrabad, Chattogram",
    division: "Chittagong",
    district: "Chattogram",
    timing: "9:30 AM - 4:00 PM",
    quotaPerDay: 350,
    status: "ACTIVE",
  },
];

interface TcbCommodityItem {
  nameBn: string;
  nameEn: string;
  tcbRate: number;
  marketRate: number;
  monthlyQuota: number; // in kg or L
  unitBn: string;
  unitEn: string;
}

const TCB_ITEMS: TcbCommodityItem[] = [
  { nameBn: "সয়াবিন তেল", nameEn: "Soybean Oil", tcbRate: 100, marketRate: 170, monthlyQuota: 2, unitBn: "লিটার", unitEn: "L" },
  { nameBn: "মসুর ডাল (আমদানিকৃত)", nameEn: "Masoor Dal (Imported)", tcbRate: 60, marketRate: 110, monthlyQuota: 2, unitBn: "কেজি", unitEn: "kg" },
  { nameBn: "দেশি পেঁয়াজ", nameEn: "Local Onion", tcbRate: 70, marketRate: 95, monthlyQuota: 2, unitBn: "কেজি", unitEn: "kg" },
  { nameBn: "গোল আলু", nameEn: "Potato", tcbRate: 40, marketRate: 55, monthlyQuota: 3, unitBn: "কেজি", unitEn: "kg" },
  { nameBn: "আটাশ চাল (ওএমএস)", nameEn: "Atash Rice (OMS/TCB)", tcbRate: 30, marketRate: 65, monthlyQuota: 5, unitBn: "কেজি", unitEn: "kg" },
];

interface TcbTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const TcbTrackerModal: React.FC<TcbTrackerModalProps> = ({ isOpen, onClose, lang }) => {
  const [search, setSearch] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("ALL");

  if (!isOpen) return null;

  // Compute family card monthly savings
  const totalTcbCost = TCB_ITEMS.reduce((sum, item) => sum + item.tcbRate * item.monthlyQuota, 0);
  const totalMarketCost = TCB_ITEMS.reduce((sum, item) => sum + item.marketRate * item.monthlyQuota, 0);
  const totalMonthlySavings = totalMarketCost - totalTcbCost;

  const filteredPoints = TCB_POINTS.filter((p) => {
    if (selectedDivision !== "ALL" && p.division !== selectedDivision) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nameEn.toLowerCase().includes(q) ||
        p.nameBn.includes(q) ||
        p.areaEn.toLowerCase().includes(q) ||
        p.areaBn.includes(q)
      );
    }
    return true;
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
                background: "rgba(56, 189, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sky)",
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "টিসিবির ভ্রাম্যমাণ ট্রাক সেল ও সাশ্রয় ট্র্যাকার" : "TCB Subsidized Open-Truck Tracker"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "ট্রেডিং কর্পোরেশন অব বাংলাদেশ (TCB) ভর্তুকি পণ্যের দর ও বিক্রয় পয়েন্ট"
                  : "Trading Corporation of Bangladesh subsidized rates and truck sale spots"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Cardholder Monthly Subsidy Benefit Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(16, 185, 129, 0.12))",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.85rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--sky)", fontWeight: 700, fontSize: "0.85rem" }}>
              <ShieldCheck size={18} />
              <span>{lang === "bn" ? "১ কোটি ফ্যামিলি কার্ডধারী পরিবারের মাসিক সাশ্রয়" : "Family Card Monthly Subsidy Benefit"}</span>
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "3px" }}>
              {lang === "bn"
                ? "তেল (২ লিটার), ডাল (২ কেজি), পেঁয়াজ (২ কেজি), আলু (৩ কেজি) ও চাল (৫ কেজি) কোটায়:"
                : "Standard package: 2L Oil, 2kg Dal, 2kg Onion, 3kg Potato & 5kg Rice:"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                {lang === "bn" ? "টিসিবি প্যাকেজ খরচ" : "TCB Package Cost"}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--sky)" }}>
                {formatPrice(totalTcbCost, lang)}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "1rem" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                {lang === "bn" ? "খুচরা বাজার খরচ" : "Retail Market Cost"}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-dim)", textDecoration: "line-through" }}>
                {formatPrice(totalMarketCost, lang)}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: "1rem" }}>
              <div style={{ fontSize: "0.68rem", color: "var(--emerald)", fontWeight: 700 }}>
                {lang === "bn" ? "মোট নগদ সাশ্রয়" : "Net Cash Saved"}
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--emerald)" }}>
                +{formatPrice(totalMonthlySavings, lang)}
              </div>
            </div>
          </div>
        </div>

        {/* TCB Price Comparison Table */}
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
            {lang === "bn" ? "সরকারি নির্ধারিত টিসিবি দর বনাম সাধারণ খুচরা দর" : "Official TCB Rates vs Neighborhood Retail"}
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.76rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.45rem 0.65rem" }}>{lang === "bn" ? "পণ্য" : "Item"}</th>
                  <th style={{ padding: "0.45rem" }}>{lang === "bn" ? "টিসিবি দর" : "TCB Subsidized"}</th>
                  <th style={{ padding: "0.45rem" }}>{lang === "bn" ? "সাধারণ খুচরা দর" : "Retail Market"}</th>
                  <th style={{ padding: "0.45rem" }}>{lang === "bn" ? "প্রতি এককে সাশ্রয়" : "Unit Savings"}</th>
                  <th style={{ padding: "0.45rem 0.65rem", textAlign: "right" }}>{lang === "bn" ? "মাসিক বরাদ্দ" : "Monthly Quota"}</th>
                </tr>
              </thead>
              <tbody>
                {TCB_ITEMS.map((item, idx) => {
                  const unit = lang === "bn" ? item.unitBn : item.unitEn;
                  const unitSave = item.marketRate - item.tcbRate;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.45rem 0.65rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {lang === "bn" ? item.nameBn : item.nameEn}
                      </td>
                      <td style={{ padding: "0.45rem", color: "var(--sky)", fontWeight: 800 }}>
                        {formatPrice(item.tcbRate, lang)}/{unit}
                      </td>
                      <td style={{ padding: "0.45rem", color: "var(--text-muted)" }}>
                        {formatPrice(item.marketRate, lang)}/{unit}
                      </td>
                      <td style={{ padding: "0.45rem", color: "var(--emerald)", fontWeight: 700 }}>
                        +{formatPrice(unitSave, lang)} (
                        {lang === "bn"
                          ? toBanglaNumber(Math.round((unitSave / item.marketRate) * 100))
                          : Math.round((unitSave / item.marketRate) * 100)}
                        %)
                      </td>
                      <td style={{ padding: "0.45rem 0.65rem", textAlign: "right", color: "var(--text-main)", fontWeight: 600 }}>
                        {lang === "bn" ? toBanglaNumber(item.monthlyQuota) : item.monthlyQuota} {unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Search & Filter for Truck Points */}
        <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <div className="search-box" style={{ flex: 1, minWidth: "180px" }}>
            <Search size={14} />
            <input
              type="text"
              className="search-input"
              placeholder={lang === "bn" ? "ট্রাক সেল পয়েন্ট খুঁজুন (যেমন: প্রেস ক্লাব, ফার্মগেট)..." : "Search truck spot..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.65rem 0.4rem 2rem" }}
            />
          </div>

          <select
            className="select-dropdown"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.65rem" }}
          >
            <option value="ALL">{lang === "bn" ? "সকল বিভাগ" : "All Divisions"}</option>
            <option value="Dhaka">{lang === "bn" ? "ঢাকা বিভাগ" : "Dhaka Division"}</option>
            <option value="Chittagong">{lang === "bn" ? "চট্টগ্রাম বিভাগ" : "Chattogram Division"}</option>
          </select>
        </div>

        {/* Truck Sale Points List */}
        <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filteredPoints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-dim)", fontSize: "0.8rem" }}>
              {lang === "bn" ? "কোনো পয়েন্ট পাওয়া যায়নি" : "No truck spots found"}
            </div>
          ) : (
            filteredPoints.map((p) => {
              const statusColor =
                p.status === "ACTIVE" ? "var(--emerald)" : p.status === "CROWDED" ? "var(--amber)" : "var(--sky)";
              const statusLabel =
                p.status === "ACTIVE"
                  ? lang === "bn" ? "বিক্রয় চলছে" : "Active"
                  : p.status === "CROWDED"
                  ? lang === "bn" ? "দীর্ঘ সারি / ভিড়" : "Crowded"
                  : lang === "bn" ? "নতুন চালান আসছে" : "Restocking";

              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.8rem",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>
                      <MapPin size={13} style={{ display: "inline", marginRight: "4px", color: "var(--sky)" }} />
                      {lang === "bn" ? p.nameBn : p.nameEn}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "2px" }}>
                      {lang === "bn" ? p.areaBn : p.areaEn} •{" "}
                      <Clock size={11} style={{ display: "inline", marginRight: "2px" }} />
                      {p.timing} •{" "}
                      <Users size={11} style={{ display: "inline", marginRight: "2px" }} />
                      {lang === "bn" ? `দৈনিক বরাদ্দ: ${toBanglaNumber(p.quotaPerDay)} পরিবার` : `Quota: ${p.quotaPerDay} families`}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      background: `${statusColor}22`,
                      color: statusColor,
                      border: `1px solid ${statusColor}44`,
                    }}
                  >
                    ● {statusLabel}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Close */}
        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
