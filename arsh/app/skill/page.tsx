"use client";

import { useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Target,
} from "lucide-react";

import styles from "./skill.module.css";

const seedModels = [
  {
    name: "ECMWF",
    provider: "ECMWF IFS",
    score: 84,
    mae: "1.21",
    rmse: "1.83",
    bias: "+0.12",
    correlation: "0.78",
    color: "blue",
  },
  {
    name: "GFS",
    provider: "NOAA GFS",
    score: 76,
    mae: "1.45",
    rmse: "2.12",
    bias: "-0.18",
    correlation: "0.71",
    color: "orange",
  },
  {
    name: "ICON",
    provider: "DWD ICON",
    score: 81,
    mae: "1.32",
    rmse: "1.96",
    bias: "+0.05",
    correlation: "0.74",
    color: "green",
  },
  {
    name: "JMA",
    provider: "JMA GSM",
    score: 79,
    mae: "1.38",
    rmse: "2.05",
    bias: "-0.10",
    correlation: "0.72",
    color: "purple",
  },
];

const regionOptions = ["North India", "Central India", "West India", "All Regions"];
const variableOptions = ["Temperature", "Rainfall", "Wind Speed", "Humidity"];
const windowOptions = ["24 Hour", "48 Hour", "72 Hour", "7 Day"];
const metricOptions = ["MAE", "RMSE", "Bias", "Correlation"];

const formatMetricValue = (value: number) => value.toFixed(2);

export default function SkillPage() {
  const [region, setRegion] = useState(regionOptions[0]);
  const [variable, setVariable] = useState(variableOptions[0]);
  const [window, setWindow] = useState(windowOptions[0]);
  const [primaryMetric, setPrimaryMetric] = useState(metricOptions[0]);
  const [lastUpdated, setLastUpdated] = useState("12 minutes ago");
  const [activeMenu, setActiveMenu] = useState<
    "region" | "variable" | "window" | "metric" | null
  >(null);
  const [models, setModels] = useState(seedModels);

  const summary = useMemo(() => {
    const avgMae =
      models.reduce((sum, model) => sum + Number(model.mae), 0) / models.length;
    const avgRmse =
      models.reduce((sum, model) => sum + Number(model.rmse), 0) / models.length;
    const avgBias =
      models.reduce((sum, model) => sum + Number(model.bias.replace("+", "")), 0) /
      models.length;
    const avgCorrelation =
      models.reduce((sum, model) => sum + Number(model.correlation), 0) / models.length;

    return {
      avgMae: formatMetricValue(avgMae),
      avgRmse: formatMetricValue(avgRmse),
      avgBias: `${avgBias >= 0 ? "+" : ""}${formatMetricValue(Math.abs(avgBias))}`,
      avgCorrelation: formatMetricValue(avgCorrelation),
    };
  }, [models]);

  const handleSelect = (
    key: "region" | "variable" | "window" | "metric",
    option: string,
  ) => {
    if (key === "region") setRegion(option);
    if (key === "variable") setVariable(option);
    if (key === "window") setWindow(option);
    if (key === "metric") setPrimaryMetric(option);
    setActiveMenu(null);
  };

  const handleRefresh = () => {
    setModels((current) =>
      current.map((model, index) => {
        const score = Math.min(
          98,
          Math.max(68, model.score + ((index % 2 === 0 ? 1 : -1) * 2)),
        );

        const mae = Number(model.mae) + (index % 2 === 0 ? 0.04 : -0.05);
        const rmse = Number(model.rmse) + (index % 2 === 0 ? 0.06 : -0.07);
        const bias = Number(model.bias.replace("+", "")) + (index % 2 === 0 ? 0.03 : -0.04);
        const correlation =
          Number(model.correlation) + (index % 2 === 0 ? 0.01 : -0.01);

        return {
          ...model,
          score,
          mae: formatMetricValue(mae),
          rmse: formatMetricValue(rmse),
          bias: `${bias >= 0 ? "+" : ""}${formatMetricValue(Math.abs(bias))}`,
          correlation: formatMetricValue(correlation),
        };
      }),
    );

    setLastUpdated("just now");
  };

  const renderSelect = (
    label: string,
    value: string,
    keyName: "region" | "variable" | "window" | "metric",
    options: string[],
  ) => (
    <div>
      <label>{label}</label>
      <button type="button" onClick={() => setActiveMenu(activeMenu === keyName ? null : keyName)}>
        {value}
        <ChevronDown size={15} />
      </button>

      {activeMenu === keyName && (
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => handleSelect(keyName, option)}
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
              ARSH <span>/</span> Skill Metrics
            </div>

            <h1>Skill Metrics</h1>

            <p>
              Evaluate forecast model performance using historical
              validation metrics.
            </p>
          </div>

          <button type="button" className={styles.refreshButton} onClick={handleRefresh}>
            <RefreshCw size={15} />
            Refresh Metrics
          </button>
        </div>

        <section className={styles.filters}>
          {renderSelect("Region", region, "region", regionOptions)}
          {renderSelect("Variable", variable, "variable", variableOptions)}
          {renderSelect("Validation Window", window, "window", windowOptions)}
          {renderSelect("Primary Metric", primaryMetric, "metric", metricOptions)}
        </section>

        <section className={styles.validationBanner}>
          <div className={styles.validationIcon}>
            <Target size={20} />
          </div>

          <div>
            <span>ACTIVE VALIDATION CONFIGURATION</span>
            <strong>{window} Validation · {variable}</strong>
            <small>{region} · Updated {lastUpdated}</small>
          </div>

          <div className={styles.validationStatus}>
            <CheckCircle2 size={14} />
            Validation Complete
          </div>
        </section>

        <div className={styles.sectionHeading}>
          <div>
            <h2>Performance Overview</h2>
            <p>
              Latest validation results across configured forecast models
            </p>
          </div>

          <span>1,248 samples evaluated</span>
        </div>

        <section className={styles.overviewGrid}>
          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.blue}`}>
              ∿
            </div>

            <div>
              <span>Average MAE</span>
              <strong>{summary.avgMae}</strong>
              <small>Mean absolute error · °C</small>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.purple}`}>
              ▥
            </div>

            <div>
              <span>Average RMSE</span>
              <strong>{summary.avgRmse}</strong>
              <small>Root mean square error · °C</small>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.green}`}>
              ◎
            </div>

            <div>
              <span>Average Correlation</span>
              <strong>{summary.avgCorrelation}</strong>
              <small>Forecast-observation correlation</small>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.metricIcon} ${styles.orange}`}>
              ↘
            </div>

            <div>
              <span>Average Bias</span>
              <strong>{summary.avgBias}</strong>
              <small>Mean systematic error · °C</small>
            </div>
          </div>
        </section>

        <div className={styles.sectionHeading}>
          <div>
            <h2>Model Performance</h2>
            <p>Current skill score and validation metrics</p>
          </div>
        </div>

        <section className={styles.modelGrid}>
          {models.map((model) => (
            <div className={styles.modelCard} key={model.name}>
              <div className={styles.modelTop}>
                <div className={styles.modelIdentity}>
                  <span
                    className={`${styles.modelDot} ${styles[model.color]}`}
                  />

                  <div>
                    <strong>{model.name}</strong>
                    <span>{model.provider}</span>
                  </div>
                </div>

                <span className={styles.validated}>
                  <CheckCircle2 size={12} />
                  Validated
                </span>
              </div>

              <div className={styles.scoreSection}>
                <div>
                  <span>Skill Score</span>

                  <strong>
                    {model.score}
                    <small>/100</small>
                  </strong>
                </div>

                <div className={styles.scoreRing}>
                  <div
                    style={{
                      background: `conic-gradient(var(--ring-color) ${
                        model.score * 3.6
                      }deg, #e9eef3 0deg)`,
                    }}
                  >
                    <span />
                  </div>
                </div>
              </div>

              <div className={styles.metrics}>
                <div>
                  <span>MAE</span>
                  <strong>{model.mae}</strong>
                </div>

                <div>
                  <span>RMSE</span>
                  <strong>{model.rmse}</strong>
                </div>

                <div>
                  <span>Bias</span>
                  <strong>{model.bias}</strong>
                </div>

                <div>
                  <span>Correlation</span>
                  <strong>{model.correlation}</strong>
                </div>
              </div>

              <div className={styles.samples}>
                <span>Validation samples</span>
                <strong>1,248</strong>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.footerPanel}>
          <div>
            <h2>Validation Summary</h2>
            <p>
              Metrics are calculated against the latest available
              observation window for North India.
            </p>
          </div>

          <div className={styles.summaryItems}>
            <div>
              <span>Validation Window</span>
              <strong>{window.toLowerCase()}</strong>
            </div>

            <div>
              <span>Samples</span>
              <strong>1,248</strong>
            </div>

            <div>
              <span>Last Updated</span>
              <strong>{lastUpdated}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}