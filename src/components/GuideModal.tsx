"use client";

import React, { useState } from "react";
import { Language, translations } from "../utils/i18n";
import {
  X,
  Building2,
  TrendingUp,
  ShoppingBag,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeStep, setActiveStep] = useState(0);
  const t = translations[lang];

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Building2 size={26} color="#38bdf8" />,
      title: t.guideStep1Title,
      desc: t.guideStep1Desc,
      tag: lang === "bn" ? "খুচরা বনাম পাইকারি" : "Retail vs Wholesale",
      highlight: lang === "bn" ? "কাওরান বাজার পাইকারি মোকামে গড় ১৫-২২% সাশ্রয়ী দর থাকে" : "Average 15-22% lower prices at central wholesale hubs",
    },
    {
      icon: <TrendingUp size={26} color="#10b981" />,
      title: t.guideStep2Title,
      desc: t.guideStep2Desc,
      tag: lang === "bn" ? "মূল্য ট্রেন্ড ও টিসিবি" : "7-Day Trends & TCB",
      highlight: lang === "bn" ? "প্রতিটি পণ্যের কার্ডে রিয়েল-টাইম ৭ দিনের দামের ওঠানামা দেখা যায়" : "Interactive SVG sparklines on every commodity card",
    },
    {
      icon: <ShoppingBag size={26} color="#f59e0b" />,
      title: t.guideStep3Title,
      desc: t.guideStep3Desc,
      tag: lang === "bn" ? "বাজেট ক্যালকুলেটর" : "Budget Calculator",
      highlight: lang === "bn" ? "আপনার পরিবারের সাপ্তাহিক বা মাসিক বাজার খরচের হিসাব করুন" : "Plan your family grocery budget and wholesale savings",
    },
    {
      icon: <Megaphone size={26} color="#f43f5e" />,
      title: t.guideStep4Title,
      desc: t.guideStep4Desc,
      tag: lang === "bn" ? "দর রিপোর্ট" : "Crowdsource Prices",
      highlight: lang === "bn" ? "যেকোনো ক্রেতা বা বিক্রেতা তার এলাকার বাজার দর যুক্ত করতে পারেন" : "Consumers across 64 districts contribute to market transparency",
    },
  ];

  const current = steps[activeStep];

  const handleFinish = () => {
    localStorage.setItem("bajaardar_onboarded", "true");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <HelpCircle size={20} color="#10b981" />
            <span>{t.guideModalTitle}</span>
          </div>
          <button className="close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Step Navigation Dots / Indicators */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              style={{
                flex: 1,
                height: "6px",
                borderRadius: "var(--radius-full)",
                background: activeStep === idx ? "var(--emerald)" : "rgba(255, 255, 255, 0.12)",
                border: "none",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
              title={s.tag}
            />
          ))}
        </div>

        {/* Step Card View */}
        <div
          style={{
            background: "rgba(11, 17, 32, 0.75)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            marginBottom: "1.25rem",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {current.icon}
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--emerald)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {current.tag}
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
                {current.title}
              </h3>
            </div>
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "1rem" }}>
            {current.desc}
          </p>

          <div
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "var(--radius-md)",
              padding: "0.6rem 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.82rem",
              color: "#34d399",
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{current.highlight}</span>
          </div>
        </div>

        {/* Quick Tips Matrix */}
        <div className="guide-tips-matrix">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`guide-tip-btn ${activeStep === idx ? "active" : ""}`}
              onClick={() => setActiveStep(idx)}
            >
              <span className="guide-tip-emoji">
                {idx === 0 ? "⚖️" : idx === 1 ? "📈" : idx === 2 ? "🧺" : "📢"}
              </span>
              <span className="guide-tip-tag">
                {s.tag}
              </span>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
          {activeStep > 0 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              <span>{t.guidePrev}</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveStep((prev) => prev + 1)}
              >
                <span>{t.guideNext}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinish}
              >
                <span>{t.guideGotIt}</span>
                <CheckCircle2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
