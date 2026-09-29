"use client";

import { Activity, Gauge, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { demoHealth } from "@/lib/demo-data";

export default function SettingsPage() {
  const [status, setStatus] = useState(demoHealth);
  const [loading, setLoading] = useState(false);

  return (
    <main className="content">
      <div className="page">
        <div className="pageHeader">
          <div>
            <div className="breadcrumb">
              ARSH <span>/</span> Settings
            </div>
            <h1>System Settings</h1>
            <p>Operational configuration and local demo data status.</p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => {
                setStatus({ ...demoHealth, timestamp: new Date().toISOString() });
                setLoading(false);
              }, 250);
            }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <section className="status-grid">
          <div className="summary-card">
            <div className="summary-icon blue">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span>Data Source</span>
              <strong>{loading ? "Checking..." : status?.status ?? "Unavailable"}</strong>
              <small>{status.message}</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">
              <Activity size={18} />
            </div>
            <div>
              <span>Environment</span>
              <strong>{status.environment}</strong>
              <small>Data source: local demo records</small>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon purple">
              <Gauge size={18} />
            </div>
            <div>
              <span>Health</span>
              <strong>{status.healthy ? "Healthy" : "Unverified"}</strong>
              <small>{status.timestamp}</small>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
