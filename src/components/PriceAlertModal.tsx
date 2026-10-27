"use client";

import React, { useState, useEffect } from "react";
import { Commodity } from "../types";
import { Language, formatPrice, toBanglaNumber } from "../utils/i18n";
import { X, Bell, BellRing, Trash2, Plus, Check, TrendingDown, ShieldAlert } from "lucide-react";

export interface PriceAlert {
  id: string;
  commodityId: string;
  targetPrice: number;
  condition: "BELOW" | "ABOVE";
  createdAt: string;
}

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodities: Commodity[];
  lang: Language;
  onAlertTriggered?: (msg: string) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  commodities,
  lang,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (commodities.length > 0 && !selectedCommodityId) {
      setSelectedCommodityId(commodities[0].id);
      setTargetPrice(Math.round(commodities[0].currentAvgPrice * 0.95).toString());
    }
  }, [commodities, selectedCommodityId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bajaardar_price_alerts");
      if (saved) {
        setAlerts(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load alerts:", e);
    }
  }, []);

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    setAlerts(newAlerts);
    try {
      localStorage.setItem("bajaardar_price_alerts", JSON.stringify(newAlerts));
    } catch (e) {
      console.error("Failed to save alerts:", e);
    }
  };

  const handleCommoditySelect = (id: string) => {
    setSelectedCommodityId(id);
    const comm = commodities.find((c) => c.id === id);
    if (comm) {
      setTargetPrice(Math.round(comm.currentAvgPrice * 0.95).toString());
    }
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!selectedCommodityId || isNaN(price) || price <= 0) return;

    const newAlert: PriceAlert = {
      id: "alt_" + Date.now(),
      commodityId: selectedCommodityId,
      targetPrice: price,
      condition: "BELOW",
      createdAt: new Date().toISOString(),
    };

    saveAlerts([...alerts, newAlert]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRemoveAlert = (id: string) => {
    saveAlerts(alerts.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  const selectedComm = commodities.find((c) => c.id === selectedCommodityId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "620px", width: "95%" }}
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
              <BellRing size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {lang === "bn" ? "টার্গেট মূল্য অ্যালার্ট ম্যানেজার" : "Target Price Alert Manager"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", margin: 0 }}>
                {lang === "bn"
                  ? "দাম কাঙ্ক্ষিত সীমায় নামলেই নোটিফিকেশন পাবেন"
                  : "Get notified when market prices drop to your target"}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Set New Alert Form */}
        <form
          onSubmit={handleAddAlert}
          style={{
            background: "var(--bg-surface)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            marginBottom: "1.2rem",
          }}
        >
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.75rem" }}>
            {lang === "bn" ? "নতুন মূল্য সতর্কতা সেট করুন" : "Set a New Price Alert"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {/* Commodity Select */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                {lang === "bn" ? "পণ্য নির্বাচন" : "Select Commodity"}
              </label>
              <select
                className="select-dropdown"
                style={{ width: "100%", padding: "0.5rem" }}
                value={selectedCommodityId}
                onChange={(e) => handleCommoditySelect(e.target.value)}
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {lang === "bn" ? c.nameBn : c.nameEn} ({formatPrice(c.currentAvgPrice, lang)})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Price Input */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                {lang === "bn" ? "টার্গেট মূল্য (টাকা)" : "Target Price (৳)"}
              </label>
              <input
                type="number"
                className="search-input"
                style={{ width: "100%", padding: "0.5rem" }}
                placeholder="40"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                min="1"
                step="0.5"
                required
              />
            </div>
          </div>

          {/* Quick presets */}
          {selectedComm && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.85rem" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                {lang === "bn" ? "দ্রুত প্রেফারেন্স:" : "Quick Presets:"}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setTargetPrice(Math.round(selectedComm.currentAvgPrice * 0.95).toString())}
              >
                {lang === "bn" ? "৫% কমলে (" : "-5% ("}
                {formatPrice(Math.round(selectedComm.currentAvgPrice * 0.95), lang)})
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setTargetPrice(Math.round(selectedComm.currentAvgPrice * 0.9).toString())}
              >
                {lang === "bn" ? "১০% কমলে (" : "-10% ("}
                {formatPrice(Math.round(selectedComm.currentAvgPrice * 0.9), lang)})
              </button>
              {selectedComm.tcbPrice && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", color: "var(--sky)" }}
                  onClick={() => setTargetPrice(selectedComm.tcbPrice!.toString())}
                >
                  {lang === "bn" ? "টিসিবি দর (" : "TCB ("}
                  {formatPrice(selectedComm.tcbPrice, lang)})
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.6rem" }}
          >
            {saveSuccess ? (
              <>
                <Check size={16} />
                <span>{lang === "bn" ? "অ্যালার্ট যুক্ত হয়েছে!" : "Alert Activated!"}</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{lang === "bn" ? "অ্যালার্ট সক্রিয় করুন" : "Activate Price Alert"}</span>
              </>
            )}
          </button>
        </form>

        {/* Existing Alerts List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
              {lang === "bn" ? "সক্রিয় অ্যালার্ট সমূহ" : "Your Active Alerts"} (
              {lang === "bn" ? toBanglaNumber(alerts.length) : alerts.length})
            </span>
          </div>

          {alerts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem 1rem",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-dim)",
                fontSize: "0.82rem",
              }}
            >
              <Bell size={24} style={{ opacity: 0.4, margin: "0 auto 0.5rem" }} />
              <div>
                {lang === "bn"
                  ? "কোনো অ্যালার্ট সেট করা নেই। উপরের ফর্ম থেকে আপনার কাঙ্ক্ষিত পণ্য ও দর নির্বাচন করুন।"
                  : "No alerts active. Choose a commodity above to track its price drops."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "250px", overflowY: "auto" }}>
              {alerts.map((alt) => {
                const comm = commodities.find((c) => c.id === alt.commodityId);
                if (!comm) return null;
                const isTriggered = comm.currentAvgPrice <= alt.targetPrice;
                const name = lang === "bn" ? comm.nameBn : comm.nameEn;
                const unit = lang === "bn" ? comm.unitBn : comm.unit;

                return (
                  <div
                    key={alt.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.65rem 0.85rem",
                      background: isTriggered ? "rgba(16, 185, 129, 0.1)" : "var(--bg-surface)",
                      border: `1px solid ${isTriggered ? "var(--emerald)" : "var(--border)"}`,
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <span style={{ fontSize: "1.4rem" }}>{comm.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main)" }}>
                          {name}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                          {lang === "bn" ? "বর্তমান: " : "Current: "}
                          <strong style={{ color: "var(--text-main)" }}>{formatPrice(comm.currentAvgPrice, lang)}</strong>/{unit} •{" "}
                          {lang === "bn" ? "টার্গেট: " : "Target: "}
                          <strong style={{ color: isTriggered ? "var(--emerald)" : "var(--amber)" }}>
                            {formatPrice(alt.targetPrice, lang)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      {isTriggered ? (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            background: "var(--emerald)",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.2rem",
                          }}
                        >
                          <TrendingDown size={12} />
                          {lang === "bn" ? "দাম কমেছে!" : "Target Reached!"}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "var(--amber)",
                          }}
                        >
                          {lang === "bn" ? "মনিটরিং হচ্ছে" : "Monitoring"}
                        </span>
                      )}

                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.35rem", color: "#f87171" }}
                        onClick={() => handleRemoveAlert(alt.id)}
                        title={lang === "bn" ? "অ্যালার্ট মুছুন" : "Delete Alert"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
