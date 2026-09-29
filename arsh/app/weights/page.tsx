"use client";

import { useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./weights.module.css";

const seedModels = [
  {
    name: "ECMWF",
    provider: "ECMWF IFS",
    weight: 28,
    error: "1.21",
    confidence: "92%",
    change: "+2%",
    color: "#2474d2",
  },
  {
    name: "GFS",
    provider: "NOAA GFS",
    weight: 24,
    error: "1.45",
    confidence: "86%",
    change: "-3%",
    color: "#e9a414",
  },
  {
    name: "ICON",
    provider: "DWD ICON",
    weight: 20,
    error: "1.32",
    confidence: "89%",
    change: "+1%",
    color: "#22a06b",
  },
  {
    name: "JMA",
    provider: "JMA GSM",
    weight: 28,
    error: "1.38",
    confidence: "87%",
    change: "0%",
    color: "#7657d7",
  },
];

const historyTemplate = [
  {
    time: "00:00",
    ECMWF: 27,
    GFS: 25,
    ICON: 21,
    JMA: 27,
  },
  {
    time: "03:00",
    ECMWF: 28,
    GFS: 24,
    ICON: 20,
    JMA: 28,
  },
  {
    time: "06:00",
    ECMWF: 27,
    GFS: 25,
    ICON: 20,
    JMA: 28,
  },
  {
    time: "09:00",
    ECMWF: 28,
    GFS: 24,
    ICON: 20,
    JMA: 28,
  },
  {
    time: "12:00",
    ECMWF: 29,
    GFS: 23,
    ICON: 20,
    JMA: 28,
  },
];

const regionOptions = [
  "North India",
  "Central India",
  "West India",
  "East India",
  "All Regions",
];

const variableOptions = [
  "Temperature",
  "Rainfall",
  "Wind Speed",
  "Humidity",
];

const strategyOptions = [
  "Inverse Error",
  "Weighted Skill",
  "Bayesian Blend",
  "Confidence First",
];

const validTimeOptions = [
  "27 Sep · 12:00 UTC",
  "28 Sep · 00:00 UTC",
  "28 Sep · 12:00 UTC",
  "29 Sep · 00:00 UTC",
];

const formatWeightChange = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export default function WeightsPage() {
  const [region, setRegion] = useState(regionOptions[0]);
  const [variable, setVariable] = useState(variableOptions[0]);
  const [strategy, setStrategy] = useState(strategyOptions[0]);
  const [validTime, setValidTime] = useState(validTimeOptions[0]);
  const [quickMenu, setQuickMenu] = useState<
    "region" | "variable" | "strategy" | "validTime" | null
  >(null);
  const [lastCalculated, setLastCalculated] = useState("12 minutes ago");
  const [models, setModels] = useState(seedModels);

  const historyData = useMemo(() => {
    const selectedBias = {
      Temperature: [27, 28, 27, 28, 29],
      Rainfall: [32, 31, 34, 33, 30],
      "Wind Speed": [24, 25, 26, 27, 29],
      Humidity: [29, 28, 30, 31, 32],
    }[variable] ?? [27, 28, 27, 28, 29];

    return historyTemplate.map((entry, index) => ({
      ...entry,
      ECMWF: selectedBias[index] + (strategy === "Bayesian Blend" ? 2 : 0),
      GFS: Math.max(16, selectedBias[index] - 2),
      ICON: Math.max(18, selectedBias[index] - 4),
      JMA: Math.max(18, selectedBias[index] - 1),
    }));
  }, [strategy, variable]);

  const handleMenuSelect = (
    key: "region" | "variable" | "strategy" | "validTime",
    option: string,
  ) => {
    if (key === "region") setRegion(option);
    if (key === "variable") setVariable(option);
    if (key === "strategy") setStrategy(option);
    if (key === "validTime") setValidTime(option);
    setQuickMenu(null);
  };

  const handleRecalculate = () => {
    setModels((current) =>
      current.map((model, index) => {
        const currentWeight = model.weight;
        const adjustment = ((index + 1) % 2 === 0 ? 1 : -1) * 1.8;
        const nextWeight = Math.min(
          45,
          Math.max(12, Number((currentWeight + adjustment).toFixed(0))),
        );

        const total =
          current.reduce((sum, item) => sum + item.weight, 0) - currentWeight + nextWeight;
        const normalized = Math.round((nextWeight / total) * 100);

        return {
          ...model,
          weight: normalized,
          confidence: `${Math.max(
            82,
            Math.min(
              97,
              Number(model.confidence.replace("%", "")) + (index === 0 ? 1 : -1),
            ),
          )}%`,
          change: formatWeightChange(
            Number(model.change.replace("%", "")) + (index % 2 === 0 ? 1.2 : -1.1),
          ),
        };
      }),
    );

    setLastCalculated("just now");
  };

  const renderSelectButton = (
    label: string,
    value: string,
    keyName: "region" | "variable" | "strategy" | "validTime",
  ) => (
    <div>
      <label>{label}</label>
      <button type="button" onClick={() => setQuickMenu(quickMenu === keyName ? null : keyName)}>
        {value}
        <ChevronDown size={15} />
      </button>

      {quickMenu === keyName && (
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {(keyName === "region"
            ? regionOptions
            : keyName === "variable"
              ? variableOptions
              : keyName === "strategy"
                ? strategyOptions
                : validTimeOptions
          ).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleMenuSelect(keyName, option)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: value === option ? "#eaf3ff" : "#fff",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="content">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.breadcrumb}>
              ARSH <span>/</span> Adaptive Weights
            </div>

            <h1>Adaptive Weights</h1>

            <p>
              Dynamic model weights generated from recent forecast
              performance and validation metrics.
            </p>
          </div>

          <button type="button" className={styles.refreshButton} onClick={handleRecalculate}>
            <RefreshCw size={15} />
            Recalculate
          </button>
        </div>

        <section className={styles.filters}>
          {renderSelectButton("Region", region, "region")}
          {renderSelectButton("Variable", variable, "variable")}
          {renderSelectButton("Weighting Strategy", strategy, "strategy")}
          {renderSelectButton("Valid Time", validTime, "validTime")}
        </section>

        <section className={styles.configBanner}>
          <div>
            <span>CURRENT WEIGHTING CONFIGURATION</span>

            <strong>{strategy.toUpperCase()}</strong>

            <small>
              {region} <b>•</b> {variable} <b>•</b> {validTime}
            </small>
          </div>

          <div className={styles.configStats}>
            <div>
              <span>Models</span>
              <strong>4 / 4</strong>
            </div>

            <div>
              <span>Total Weight</span>
              <strong>100%</strong>
            </div>

            <div>
              <span>Update Frequency</span>
              <strong>3 Hours</strong>
            </div>

            <div>
              <span>Status</span>
              <strong className={styles.activeStatus}>ACTIVE</strong>
            </div>
          </div>
        </section>

        <div className={styles.sectionHeading}>
          <div>
            <h2>Current Model Weights</h2>
            <p>
              Contribution assigned to each model in the final blend
            </p>
          </div>

          <span>Last calculated {lastCalculated}</span>
        </div>

        <section className={styles.modelGrid}>
          {models.map((model) => (
            <div className={styles.modelCard} key={model.name}>
              <div className={styles.modelTop}>
                <div className={styles.modelIdentity}>
                  <span
                    className={styles.modelDot}
                    style={{
                      background: model.color,
                    }}
                  />

                  <div>
                    <strong>{model.name}</strong>
                    <span>{model.provider}</span>
                  </div>
                </div>

                <CheckCircle2
                  size={15}
                  className={styles.check}
                />
              </div>

              <div className={styles.weightValue}>
                {model.weight}
                <span>%</span>

                <small
                  className={
                    model.change.startsWith("-")
                      ? styles.down
                      : styles.up
                  }
                >
                  {model.change}
                </small>
              </div>

              <div className={styles.weightTrack}>
                <div
                  style={{
                    width: `${model.weight}%`,
                    background: model.color,
                  }}
                />
              </div>

              <div className={styles.modelDetails}>
                <div>
                  <span>Recent error</span>
                  <strong>{model.error}</strong>
                </div>

                <div>
                  <span>Confidence</span>
                  <strong>{model.confidence}</strong>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.chartsGrid}>
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Weight Adaptation History</h2>
                <p>
                  How model contributions changed over the latest update
                  window
                </p>
              </div>

              <span>Last 12 hours</span>
            </div>

            <div className={styles.historyChart}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="ECMWF"
                    stackId="1"
                    stroke="#2474d2"
                    fill="#2474d2"
                    fillOpacity={0.18}
                  />

                  <Area
                    type="monotone"
                    dataKey="GFS"
                    stackId="1"
                    stroke="#e9a414"
                    fill="#e9a414"
                    fillOpacity={0.18}
                  />

                  <Area
                    type="monotone"
                    dataKey="ICON"
                    stackId="1"
                    stroke="#22a06b"
                    fill="#22a06b"
                    fillOpacity={0.18}
                  />

                  <Area
                    type="monotone"
                    dataKey="JMA"
                    stackId="1"
                    stroke="#7657d7"
                    fill="#7657d7"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Current Distribution</h2>
                <p>Share of final blended forecast</p>
              </div>

              <span>100%</span>
            </div>

            <div className={styles.distribution}>
              <div className={styles.donut}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={models}
                      dataKey="weight"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={2}
                    >
                      {models.map((model) => (
                        <Cell
                          key={model.name}
                          fill={model.color}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className={styles.donutCenter}>
                  <strong>100%</strong>
                  <span>Blend</span>
                </div>
              </div>

              <div className={styles.legend}>
                {models.map((model) => (
                  <div key={model.name}>
                    <span>
                      <i
                        style={{
                          background: model.color,
                        }}
                      />
                      {model.name}
                    </span>

                    <strong>{model.weight}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.strategyPanel}>
          <div>
            <h2>Weighting Strategy</h2>
            <p>
              The adaptive blender recalculates model contribution using
              recent validation error and forecast confidence.
            </p>
          </div>

          <div className={styles.strategyValues}>
            <div>
              <span>Strategy</span>
              <strong>Inverse Error</strong>
            </div>

            <div>
              <span>Adaptation Window</span>
              <strong>7 days</strong>
            </div>

            <div>
              <span>Update Frequency</span>
              <strong>3 hours</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}