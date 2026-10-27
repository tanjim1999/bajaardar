"use client";

import React, { useState } from "react";
import { Commodity } from "../types";
import { Language, formatPrice, toBanglaNumber } from "../utils/i18n";
import { X, Share2, Copy, Download, Check, MessageSquare } from "lucide-react";

interface SmartShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  lang: Language;
}

export const SmartShareModal: React.FC<SmartShareModalProps> = ({
  isOpen,
  onClose,
  commodities,
  lang,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build clean market brief text
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const topItems = commodities.slice(0, 6);

  const briefTextBn = `📊 আজকের বাজার দর (${today})
⚖️ বাজার দর (BajaarDar) — ঢাকা ও বিভাগীয় পাইকারি/খুচরা আপডেট

${topItems
  .map(
    (c) =>
      `${c.icon} ${c.nameBn}: খুচরা ৳${toBanglaNumber(c.currentAvgPrice)}/${c.unitBn} (কাওরান বাজার পাইকারি ৳${toBanglaNumber(
        c.wholesalePrice
      )})`
  )
  .join("\n")}

🚛 টিসিবি ভর্তুকি দর: আলু ৳৪০, পেঁয়াজ ৳৭০, সয়াবিন ৳১০০
🔍 আরও জানতে ও বাজারের ফর্দ মেলাতে দেখুন: https://bajaardar-3vbw.vercel.app`;

  const briefTextEn = `📊 Today's Market Price Index (${today})
⚖️ BajaarDar — Bangladesh Commodity Benchmark

${topItems
  .map((c) => `${c.icon} ${c.nameEn}: Retail ৳${c.currentAvgPrice}/${c.unit} (Wholesale ৳${c.wholesalePrice})`)
  .join("\n")}

🚛 TCB Subsidized: Potato ৳40, Onion ৳70, Soybean ৳100
🔍 Compare full rates and calculate grocery budget at: https://bajaardar-3vbw.vercel.app`;

  const shareText = lang === "bn" ? briefTextBn : briefTextEn;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleDownloadCsv = () => {
    const headers = ["ID", "Name_En", "Name_Bn", "Category", "Unit", "Retail_Price_BDT", "Wholesale_Price_BDT", "TCB_Price_BDT", "24h_Change_Percent"];
    const rows = commodities.map((c) => [
      c.id,
      `"${c.nameEn}"`,
      `"${c.nameBn}"`,
      c.category,
      c.unit,
      c.currentAvgPrice,
      c.wholesalePrice,
      c.tcbPrice || "N/A",
      c.change24h,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bajaardar_prices_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "95%" }}
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
              <Share2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "দৈনিক বাজার দর শেয়ার ও এক্সপোর্ট" : "Share Today's Market Rates & Export"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "হোয়াটসঅ্যাপে দর পাঠান অথবা পূর্ণাঙ্গ ডাটা শিট CSV আকারে ডাউনলোড করুন"
                  : "Send market brief to WhatsApp or download raw dataset in CSV"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Live Preview Box */}
        <div style={{ marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 700 }}>
            {lang === "bn" ? "শেয়ার মেসেজের প্রিভিউ:" : "Message Preview:"}
          </div>
          <pre
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "0.85rem",
              fontSize: "0.75rem",
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
              color: "var(--text-main)",
              lineHeight: 1.5,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {shareText}
          </pre>
        </div>

        {/* Action Buttons Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.65rem", marginBottom: "1rem" }}>
          {/* WhatsApp Direct */}
          <button
            className="btn btn-primary"
            style={{ background: "#25D366", borderColor: "#25D366", color: "#fff", justifyContent: "center" }}
            onClick={handleWhatsAppShare}
          >
            <MessageSquare size={16} />
            <span>{lang === "bn" ? "হোয়াটসঅ্যাপে পাঠান" : "Share on WhatsApp"}</span>
          </button>

          {/* Copy to Clipboard */}
          <button
            className="btn btn-secondary"
            style={{ justifyContent: "center" }}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={16} style={{ color: "var(--emerald)" }} />
                <span>{lang === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>{lang === "bn" ? "টেক্সট কপি করুন" : "Copy Brief Text"}</span>
              </>
            )}
          </button>

          {/* CSV Download */}
          <button
            className="btn btn-secondary"
            style={{ justifyContent: "center", color: "var(--sky)", borderColor: "rgba(56, 189, 248, 0.4)" }}
            onClick={handleDownloadCsv}
          >
            <Download size={16} />
            <span>{lang === "bn" ? "CSV ডাউনলোড (.csv)" : "Download CSV Data"}</span>
          </button>
        </div>

        <div style={{ textAlign: "right" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
