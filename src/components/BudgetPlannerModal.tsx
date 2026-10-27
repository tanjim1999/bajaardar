"use client";

import React, { useState, useMemo } from "react";
import { Commodity, BasketItem } from "../types";
import { Language, formatPrice, toBanglaNumber, formatPercent } from "../utils/i18n";
import { X, Users, Calendar, ShoppingBag, TrendingUp, Sparkles, Building2, ShieldCheck, Check } from "lucide-react";

interface BudgetPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  lang: Language;
  onAddMultipleToBasket: (items: { commodity: Commodity; quantity: number }[]) => void;
}

interface HouseholdPreset {
  id: string;
  nameBn: string;
  nameEn: string;
  persons: number;
  multiplier: number;
}

const PRESETS: HouseholdPreset[] = [
  { id: "p2", nameBn: "ছোট পরিবার (২ জন)", nameEn: "Couple / 2 Persons", persons: 2, multiplier: 0.55 },
  { id: "p4", nameBn: "আদর্শ পরিবার (৪ জন)", nameEn: "Standard Family (4 Persons)", persons: 4, multiplier: 1.0 },
  { id: "p6", nameBn: "যৌথ পরিবার (৬ জন)", nameEn: "Joint Family (6 Persons)", persons: 6, multiplier: 1.55 },
];

export const BudgetPlannerModal: React.FC<BudgetPlannerModalProps> = ({
  isOpen,
  onClose,
  commodities,
  lang,
  onAddMultipleToBasket,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState("p4");
  const [durationDays, setDurationDays] = useState<number>(30); // 7, 15, or 30 days
  const [inflationPercent, setInflationPercent] = useState<number>(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Baseline standard 30-day family-of-4 bundle in kg / liters / dozens
  const baseBundleConfig: Record<string, number> = {
    "miniket-rice": 30, // kg
    "soybean-oil-1l": 5, // L
    "potato": 12, // kg
    "local-onion": 6, // kg
    "masoor-dal": 3, // kg
    "broiler-chicken": 6, // kg
    "eggs-dozen": 3, // dozen
    "green-chili": 1, // kg
    "garlic-local": 1, // kg
    "ginger-imported": 1, // kg
  };

  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[1];

  // Map configuration to matched commodities
  const computedItems = useMemo(() => {
    const durationMultiplier = durationDays / 30;
    const items: { commodity: Commodity; quantity: number; retailTotal: number; wholesaleTotal: number; tcbTotal: number }[] = [];

    // Keyword matching helper
    const findCommodity = (keywords: string[]) => {
      return commodities.find((c) =>
        keywords.some(
          (k) =>
            c.id.toLowerCase().includes(k) ||
            c.nameEn.toLowerCase().includes(k) ||
            c.nameBn.includes(k)
        )
      );
    };

    const targets = [
      { keys: ["miniket", "rice", "মিনিকেট", "চাল"], defaultQty: 30 },
      { keys: ["soybean", "oil", "সয়াবিন", "তেল"], defaultQty: 5 },
      { keys: ["potato", "আলু"], defaultQty: 12 },
      { keys: ["onion", "local onion", "পেঁয়াজ"], defaultQty: 6 },
      { keys: ["masoor", "dal", "মসুর", "ডাল"], defaultQty: 3 },
      { keys: ["broiler", "chicken", "ব্রয়লার", "মুরগি"], defaultQty: 6 },
      { keys: ["egg", "ডিম"], defaultQty: 3 },
      { keys: ["chili", "green chili", "মরিচ", "কাঁচামরিচ"], defaultQty: 1 },
      { keys: ["garlic", "রসুন"], defaultQty: 1 },
      { keys: ["ginger", "আদা"], defaultQty: 1 },
    ];

    for (const t of targets) {
      const comm = findCommodity(t.keys);
      if (comm) {
        // Calculate tailored quantity based on family size & duration
        const rawQty = t.defaultQty * selectedPreset.multiplier * durationMultiplier;
        const qty = Math.max(0.5, Math.round(rawQty * 10) / 10);
        const retailRate = comm.currentAvgPrice * (1 + inflationPercent / 100);
        const wholesaleRate = comm.wholesalePrice * (1 + inflationPercent / 100);
        const tcbRate = (comm.tcbPrice || comm.wholesalePrice) * (1 + inflationPercent / 100);

        items.push({
          commodity: comm,
          quantity: qty,
          retailTotal: Math.round(qty * retailRate),
          wholesaleTotal: Math.round(qty * wholesaleRate),
          tcbTotal: Math.round(qty * tcbRate),
        });
      }
    }

    return items;
  }, [commodities, selectedPreset, durationDays, inflationPercent]);

  // Aggregate totals
  const totalRetail = computedItems.reduce((acc, i) => acc + i.retailTotal, 0);
  const totalWholesale = computedItems.reduce((acc, i) => acc + i.wholesaleTotal, 0);
  const totalTcb = computedItems.reduce((acc, i) => acc + i.tcbTotal, 0);
  const totalSavings = totalRetail - totalWholesale;
  const savingsPct = totalRetail > 0 ? Math.round((totalSavings / totalRetail) * 100) : 0;

  const handleAddAllToBasket = () => {
    const list = computedItems.map((i) => ({ commodity: i.commodity, quantity: i.quantity }));
    onAddMultipleToBasket(list);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  if (!isOpen) return null;

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
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "মাসিক পারিবারিক বাজার বাজেট প্ল্যানার" : "Monthly Household Budget Planner"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "পরিবারের সদস্য অনুযায়ী ব্যয়ের পূর্বাভাস ও পাইকারি সাশ্রয় হিসাব করুন"
                  : "Forecast grocery expenses and wholesale savings tailored to your family"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Controls: Family Size & Duration */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1rem",
            background: "var(--bg-surface)",
            padding: "0.85rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Family Size Selection */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.35rem", fontWeight: 700 }}>
              <Users size={12} style={{ display: "inline", marginRight: "4px" }} />
              {lang === "bn" ? "পরিবারের সদস্য সংখ্যা" : "Family Size"}
            </label>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  className={`btn ${selectedPresetId === p.id ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1, padding: "0.35rem 0.4rem", fontSize: "0.72rem", textAlign: "center" }}
                  onClick={() => setSelectedPresetId(p.id)}
                >
                  {lang === "bn" ? p.nameBn : p.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.35rem", fontWeight: 700 }}>
              <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
              {lang === "bn" ? "বাজারের সময়কাল" : "Budget Duration"}
            </label>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {[
                { days: 7, labelBn: "১ সপ্তাহ", labelEn: "1 Week" },
                { days: 15, labelBn: "১৫ দিন", labelEn: "15 Days" },
                { days: 30, labelBn: "১ মাস", labelEn: "1 Month" },
              ].map((d) => (
                <button
                  key={d.days}
                  className={`btn ${durationDays === d.days ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1, padding: "0.35rem 0.4rem", fontSize: "0.72rem", textAlign: "center" }}
                  onClick={() => setDurationDays(d.days)}
                >
                  {lang === "bn" ? d.labelBn : d.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inflation Simulation Slider */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "0.65rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
            <TrendingUp size={13} style={{ display: "inline", marginRight: "5px", color: "var(--rose)" }} />
            {lang === "bn" ? "মূল্যস্ফীতি পূর্বাভাস সিমুলেটর:" : "Inflation Impact Simulator:"}{" "}
            <strong style={{ color: inflationPercent > 0 ? "var(--rose)" : "var(--emerald)" }}>
              {inflationPercent > 0 ? `+${inflationPercent}%` : `${inflationPercent}%`}
            </strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="range"
              min="-10"
              max="20"
              step="5"
              value={inflationPercent}
              onChange={(e) => setInflationPercent(parseInt(e.target.value, 10))}
              style={{ width: "120px", cursor: "pointer" }}
            />
            <button
              className="btn btn-secondary"
              style={{ padding: "0.15rem 0.45rem", fontSize: "0.68rem" }}
              onClick={() => setInflationPercent(0)}
            >
              {lang === "bn" ? "রিসেট" : "Reset"}
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.65rem",
            marginBottom: "1.2rem",
          }}
        >
          {/* Retail Total */}
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontWeight: 700 }}>
              {lang === "bn" ? "খুচরা বাজারের আনুমানিক খরচ" : "Estimated Retail Budget"}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
              {formatPrice(totalRetail, lang)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {lang === "bn" ? "মহল্লার দোকান দর" : "Neighborhood shops"}
            </div>
          </div>

          {/* Wholesale Total */}
          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.7rem", color: "var(--amber)", fontWeight: 700 }}>
              <Building2 size={12} style={{ display: "inline", marginRight: "3px" }} />
              {lang === "bn" ? "কাওরান বাজার পাইকারি খরচ" : "Wholesale Hub Budget"}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--amber)", marginTop: "2px" }}>
              {formatPrice(totalWholesale, lang)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {lang === "bn" ? "সরাসরি আড়ত থেকে" : "Direct wholesale auction"}
            </div>
          </div>

          {/* Estimated Savings */}
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.7rem", color: "var(--emerald)", fontWeight: 700 }}>
              {lang === "bn" ? "মাসিক সম্ভাব্য সাশ্রয়" : "Estimated Bulk Savings"}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--emerald)", marginTop: "2px" }}>
              {formatPrice(totalSavings, lang)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--emerald)", fontWeight: 700, marginTop: "2px" }}>
              {lang === "bn" ? `~${toBanglaNumber(savingsPct)}% টাকা সাশ্রয়!` : `~${savingsPct}% saved!`}
            </div>
          </div>
        </div>

        {/* Itemized Table Breakdown */}
        <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.5rem 0.75rem" }}>{lang === "bn" ? "পণ্য" : "Item"}</th>
                <th style={{ padding: "0.5rem" }}>{lang === "bn" ? "প্রয়োজনীয় পরিমাণ" : "Est. Qty"}</th>
                <th style={{ padding: "0.5rem" }}>{lang === "bn" ? "খুচরা দর" : "Retail Total"}</th>
                <th style={{ padding: "0.5rem" }}>{lang === "bn" ? "পাইকারি দর" : "Wholesale"}</th>
                <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>{lang === "bn" ? "সাশ্রয়" : "Savings"}</th>
              </tr>
            </thead>
            <tbody>
              {computedItems.map((item) => {
                const name = lang === "bn" ? item.commodity.nameBn : item.commodity.nameEn;
                const unit = lang === "bn" ? item.commodity.unitBn : item.commodity.unit;
                const diff = item.retailTotal - item.wholesaleTotal;

                return (
                  <tr key={item.commodity.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.45rem 0.75rem", fontWeight: 600, color: "var(--text-main)" }}>
                      <span style={{ marginRight: "6px" }}>{item.commodity.icon}</span>
                      {name}
                    </td>
                    <td style={{ padding: "0.45rem", color: "var(--text-muted)" }}>
                      {lang === "bn" ? toBanglaNumber(item.quantity) : item.quantity} {unit}
                    </td>
                    <td style={{ padding: "0.45rem", fontWeight: 700, color: "var(--text-main)" }}>
                      {formatPrice(item.retailTotal, lang)}
                    </td>
                    <td style={{ padding: "0.45rem", color: "var(--amber)", fontWeight: 700 }}>
                      {formatPrice(item.wholesaleTotal, lang)}
                    </td>
                    <td style={{ padding: "0.45rem 0.75rem", textAlign: "right", color: "var(--emerald)", fontWeight: 700 }}>
                      +{formatPrice(diff, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
          <button className="btn btn-primary" onClick={handleAddAllToBasket}>
            {addedSuccess ? (
              <>
                <Check size={16} />
                <span>{lang === "bn" ? "সবগুলো থলেতে যোগ হয়েছে!" : "Added to Basket!"}</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>{lang === "bn" ? "সবগুলো থলেতে যোগ করুন" : "Add Bundle to My Basket"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
