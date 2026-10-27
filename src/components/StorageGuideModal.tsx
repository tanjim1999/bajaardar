"use client";

import React from "react";
import { Language } from "../utils/i18n";
import { X, Lightbulb, ShieldCheck, Flame, Droplets, Leaf, AlertCircle } from "lucide-react";

interface StorageTip {
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  categoryEn: string;
  icon: string;
  practicalMethodBn: string;
  practicalMethodEn: string;
  benefitBn: string;
  benefitEn: string;
}

const STORAGE_TIPS: StorageTip[] = [
  {
    titleBn: "আলু ও পেঁয়াজ সবসময় আলাদা সংরক্ষণ করুন",
    titleEn: "Never Store Potatoes and Onions Together",
    categoryBn: "পচন রোধ",
    categoryEn: "Anti-Rotting",
    icon: "🥔",
    practicalMethodBn: "পেঁয়াজ থেকে নির্গত ইথিলিন গ্যাস আলুর অংকুরোদগম (স্প্রাউটিং) ত্বরান্বিত করে। উভয়কে শুষ্ক, বাতাস চলাচলযুক্ত অন্ধকার ঝুড়িতে আলাদা রাখুন।",
    practicalMethodEn: "Onions release ethylene gas which triggers rapid sprouting in potatoes. Keep them in separate airy baskets away from direct sunlight.",
    benefitBn: "আলু ও পেঁয়াজের স্থায়িত্ব দ্বিগুণ (৪-৬ সপ্তাহ) বৃদ্ধি পায়।",
    benefitEn: "Extends shelf-life by 2x (4 to 6 weeks).",
  },
  {
    titleBn: "কাঁচামরিচ ও ধনেপাতা ২৫-৩০ দিন তাজা রাখার উপায়",
    titleEn: "Keep Green Chilies & Cilantro Crisp for 30 Days",
    categoryBn: "সতেজতা",
    categoryEn: "Freshness",
    icon: "🌶️",
    practicalMethodBn: "কাঁচামরিচের বোঁটা সাবধানে ফেলে দিয়ে শুকনো কাপড় বা টিস্যু দিয়ে মুছে বায়ুরোধী (Airtight) প্লাস্টিক বক্সে কিচেন টিস্যু পেপার দিয়ে স্তর সাজিয়ে ফ্রিজে রাখুন।",
    practicalMethodEn: "Pluck green chili stems off, thoroughly pat dry with tissue paper, and pack in an airtight plastic container lined with absorbent paper.",
    benefitBn: "মরিচে কোনো পানি জমবে না ও কালো হয়ে পচে যাবে না।",
    benefitEn: "Zero moisture rot; maintains crispness and heat.",
  },
  {
    titleBn: "মাছে ফরমালিন ও রাসায়নিক চেনার সহজ ঘরোয়া উপায়",
    titleEn: "Household Checks for Formalin and Chemical Dyes",
    categoryBn: "নিরাপদ খাদ্য",
    categoryEn: "Food Safety",
    icon: "🐟",
    practicalMethodBn: "তাজা দেশি মাছের ফুলকা (Gills) রক্তিম লাল থাকবে ও চোখে কোনো সাদা ঘোলাটে আবরণ থাকবে না। মাছ রান্নার আগে লবণ ও ভিনেগার মিশ্রিত পানিতে ১৫ মিনিট ভিজিয়ে রাখলে ক্ষতিকর রাসায়নিক দূর হয়।",
    practicalMethodEn: "Fresh fish features blood-red gills and crystal-clear cornea. Soaking raw fish in saltwater with a dash of white vinegar cleans residual surface chemicals.",
    benefitBn: "পরিবারের স্বাস্থ্য ও শিশুদের জন্য নিরাপদ আহার নিশ্চিত হয়।",
    benefitEn: "Guarantees pure, chemical-safe nutrition for your family.",
  },
  {
    titleBn: "হলুদ ও মরিচের গুঁড়ায় মেটানিল ইয়েলো বা ইটের গুঁড়া শনাক্তকরণ",
    titleEn: "Detect Metanil Yellow or Sawdust Adulteration in Spices",
    categoryBn: "ভেজাল পরীক্ষা",
    categoryEn: "Purity Check",
    icon: "🧂",
    practicalMethodBn: "এক গ্লাস সাধারণ পানিতে এক চামচ হলুদের গুঁড়া মেশান। আসল হলুদ ধীরে ধীরে তলায় জমবে ও পানি হালকা হলুদ থাকবে। কৃত্রিম রঙ মেশানো থাকলে পানি সাথে সাথে গাঢ় উজ্জ্বল হলুদ হয়ে যাবে।",
    practicalMethodEn: "Stir 1 spoon of turmeric powder into a glass of warm water. Pure turmeric settles down leaving pale clear water; adulterated synthetic dyes instantly tint the water neon yellow.",
    benefitBn: "লিভার ও কিডনির জন্য ক্ষতিকর কৃত্রিম বিষাক্ত রঙ এড়ানো যায়।",
    benefitEn: "Shields family health from toxic industrial coloring agents.",
  },
];

interface StorageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const StorageGuideModal: React.FC<StorageGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px", width: "95%" }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--amber)",
              }}
            >
              <Lightbulb size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "রান্নাঘর সাশ্রয় ও পণ্য সংরক্ষণ স্মার্ট গাইড" : "Smart Food Storage & Anti-Waste Guide"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "পণ্য পচন রোধ, অপচয় হ্রাস ও ভেজালমুক্ত খাদ্য যাচাইয়ের বিজ্ঞানসম্মত কৌশল"
                  : "Science-backed techniques to eliminate kitchen waste and verify food purity"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tip Cards Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
          {STORAGE_TIPS.map((tip, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "0.9rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.4rem" }}>{tip.icon}</span>
                  <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-main)" }}>
                    {lang === "bn" ? tip.titleBn : tip.titleEn}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "var(--radius-full)",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--emerald)",
                  }}
                >
                  {lang === "bn" ? tip.categoryBn : tip.categoryEn}
                </span>
              </div>

              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "0.45rem" }}>
                {lang === "bn" ? tip.practicalMethodBn : tip.practicalMethodEn}
              </div>

              <div
                style={{
                  background: "rgba(2, 132, 199, 0.08)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.35rem 0.65rem",
                  fontSize: "0.72rem",
                  color: "var(--sky)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                <span>
                  {lang === "bn" ? "সাশ্রয় ও সুফল: " : "Benefit: "}
                  {lang === "bn" ? tip.benefitBn : tip.benefitEn}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.2rem", textAlign: "right" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
