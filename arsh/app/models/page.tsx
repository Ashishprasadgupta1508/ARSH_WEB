"use client";

import {
  CheckCircle2,
  ChevronDown,
  CloudRain,
  RefreshCw,
  Wind,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./models.module.css";

type Variable = "T2M" | "RR" | "WSPD";
type Region =
  | "GLOBAL"
  | "NORTH_INDIA"
  | "CENTRAL_INDIA"
  | "WEST_INDIA"
  | "EAST_INDIA";

type ModelCode = "ALL" | "ECMWF" | "GFS" | "ICON" | "JMA";

type ModelData = {
  code: Exclude<ModelCode, "ALL">;
  source: string;
  color: string;
  value: number;
  weight: number;
  rmse: number;
  skill: number;
  mae: number;
};

const MODEL_DATA: Record<Variable, ModelData[]> = {
  T2M: [
    {
      code: "ECMWF",
      source: "OPEN_METEO_ECMWF",
      color: "#2474d2",
      value: 31.8,
      weight: 32,
      rmse: 1.83,
      skill: 78,
      mae: 1.21,
    },
    {
      code: "GFS",
      source: "OPEN_METEO_GFS",
      color: "#e9a414",
      value: 30.6,
      weight: 24,
      rmse: 2.12,
      skill: 71,
      mae: 1.45,
    },
    {
      code: "ICON",
      source: "OPEN_METEO_ICON",
      color: "#22a06b",
      value: 31.5,
      weight: 22,
      rmse: 1.96,
      skill: 74,
      mae: 1.32,
    },
    {
      code: "JMA",
      source: "OPEN_METEO_JMA",
      color: "#7657d7",
      value: 32.1,
      weight: 22,
      rmse: 1.72,
      skill: 76,
      mae: 1.38,
    },
  ],

  RR: [
    {
      code: "ECMWF",
      source: "OPEN_METEO_ECMWF",
      color: "#2474d2",
      value: 8.4,
      weight: 32,
      rmse: 2.14,
      skill: 76,
      mae: 1.52,
    },
    {
      code: "GFS",
      source: "OPEN_METEO_GFS",
      color: "#e9a414",
      value: 10.2,
      weight: 24,
      rmse: 2.63,
      skill: 68,
      mae: 1.81,
    },
    {
      code: "ICON",
      source: "OPEN_METEO_ICON",
      color: "#22a06b",
      value: 9.1,
      weight: 22,
      rmse: 2.31,
      skill: 72,
      mae: 1.64,
    },
    {
      code: "JMA",
      source: "OPEN_METEO_JMA",
      color: "#7657d7",
      value: 8.8,
      weight: 22,
      rmse: 2.26,
      skill: 74,
      mae: 1.59,
    },
  ],

  WSPD: [
    {
      code: "ECMWF",
      source: "OPEN_METEO_ECMWF",
      color: "#2474d2",
      value: 5.8,
      weight: 32,
      rmse: 1.18,
      skill: 81,
      mae: 0.82,
    },
    {
      code: "GFS",
      source: "OPEN_METEO_GFS",
      color: "#e9a414",
      value: 6.4,
      weight: 24,
      rmse: 1.42,
      skill: 73,
      mae: 1.03,
    },
    {
      code: "ICON",
      source: "OPEN_METEO_ICON",
      color: "#22a06b",
      value: 6.1,
      weight: 22,
      rmse: 1.27,
      skill: 78,
      mae: 0.91,
    },
    {
      code: "JMA",
      source: "OPEN_METEO_JMA",
      color: "#7657d7",
      value: 5.9,
      weight: 22,
      rmse: 1.21,
      skill: 79,
      mae: 0.87,
    },
  ],
};

const VARIABLE_LABELS: Record<Variable, string> = {
  T2M: "Temperature",
  RR: "Rainfall",
  WSPD: "Wind Speed",
};

const UNIT_LABELS: Record<Variable, string> = {
  T2M: "°C",
  RR: "mm",
  WSPD: "m/s",
};

const REGION_LABELS: Record<Region, string> = {
  GLOBAL: "Global",
  NORTH_INDIA: "North India",
  CENTRAL_INDIA: "Central India",
  WEST_INDIA: "West India",
  EAST_INDIA: "East India",
};

const VALID_TIMES = [
  "29 Sep 2026 · 12:00 UTC",
  "29 Sep 2026 · 18:00 UTC",
  "30 Sep 2026 · 00:00 UTC",
  "30 Sep 2026 · 06:00 UTC",
];

export default function ModelsPage() {
  const router = useRouter();

  const [variable, setVariable] = useState<Variable>("T2M");
  const [region, setRegion] = useState<Region>("NORTH_INDIA");
  const [validTime, setValidTime] = useState(VALID_TIMES[0]);
  const [modelFilter, setModelFilter] = useState<ModelCode>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("05:59 UTC");

  const models = MODEL_DATA[variable];

  const visibleModels = useMemo(() => {
    if (modelFilter === "ALL") {
      return models;
    }

    return models.filter((model) => model.code === modelFilter);
  }, [models, modelFilter]);

  const blendedValue = useMemo(() => {
    const weightedTotal = models.reduce(
      (sum, model) => sum + model.value * (model.weight / 100),
      0,
    );

    return weightedTotal;
  }, [models]);

  const chartData = visibleModels.map((model) => ({
    model: model.code,
    rmse: model.rmse,
  }));

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      const now = new Date();

      setLastUpdated(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) + " UTC",
      );

      setRefreshing(false);
    }, 700);
  };

  const handleVariableChange = (nextVariable: Variable) => {
    setVariable(nextVariable);
    setModelFilter("ALL");
  };

  return (
    <main className="content">
      <div className={styles.page}>
        {/* HEADER */}
        <header className={styles.pageHeader}>
          <div>
            <div className={styles.breadcrumb}>
              ARSH <span>/</span> Model Comparison
            </div>

            <h1>Model Comparison</h1>

            <p>
              Compare numerical weather prediction models before generating the
              blended forecast.
            </p>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={refreshing ? styles.spin : undefined}
            />

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </header>

        {/* FILTERS */}
        <section className={styles.filters}>
          <div>
            <label htmlFor="variable">Variable</label>

            <div className={styles.selectWrapper}>
              <select
                id="variable"
                value={variable}
                onChange={(event) =>
                  handleVariableChange(event.target.value as Variable)
                }
              >
                <option value="T2M">Temperature</option>
                <option value="RR">Rainfall</option>
                <option value="WSPD">Wind Speed</option>
              </select>

              <ChevronDown size={14} />
            </div>
          </div>

          <div>
            <label htmlFor="region">Region</label>

            <div className={styles.selectWrapper}>
              <select
                id="region"
                value={region}
                onChange={(event) =>
                  setRegion(event.target.value as Region)
                }
              >
                <option value="GLOBAL">Global</option>
                <option value="NORTH_INDIA">North India</option>
                <option value="CENTRAL_INDIA">Central India</option>
                <option value="WEST_INDIA">West India</option>
                <option value="EAST_INDIA">East India</option>
              </select>

              <ChevronDown size={14} />
            </div>
          </div>

          <div>
            <label htmlFor="validTime">Valid Time</label>

            <div className={styles.selectWrapper}>
              <select
                id="validTime"
                value={validTime}
                onChange={(event) => setValidTime(event.target.value)}
              >
                {VALID_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <ChevronDown size={14} />
            </div>
          </div>

          <div>
            <label htmlFor="model">Model</label>

            <div className={styles.selectWrapper}>
              <select
                id="model"
                value={modelFilter}
                onChange={(event) =>
                  setModelFilter(event.target.value as ModelCode)
                }
              >
                <option value="ALL">All Models</option>
                <option value="ECMWF">ECMWF</option>
                <option value="GFS">GFS</option>
                <option value="ICON">ICON</option>
                <option value="JMA">JMA</option>
              </select>

              <ChevronDown size={14} />
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Comparison Overview</h2>

              <p>
                Current model output for {REGION_LABELS[region].toUpperCase()}
              </p>
            </div>

            <span>{visibleModels.length} models available</span>
          </div>

          <div className={styles.modelGrid}>
            {visibleModels.map((model) => (
              <article className={styles.modelCard} key={model.code}>
                <div className={styles.modelCardTop}>
                  <div className={styles.modelIdentity}>
                    <i
                      className={styles.modelDot}
                      style={{ background: model.color }}
                    />

                    <div>
                      <strong>{model.code}</strong>
                      <span>{model.source}</span>
                    </div>
                  </div>

                  <span className={styles.available}>
                    <CheckCircle2 size={10} />
                    Available
                  </span>
                </div>

                <div className={styles.temperatureLabel}>
                  {VARIABLE_LABELS[variable]}
                </div>

                <div className={styles.temperature}>
                  {model.value.toFixed(1)}
                  <span>{UNIT_LABELS[variable]}</span>
                </div>

                <div className={styles.modelMetrics}>
                  <div>
                    <span>
                      <CloudRain size={11} />
                      Weight
                    </span>

                    <strong>{model.weight.toFixed(1)}%</strong>
                  </div>

                  <div>
                    <span>
                      <Wind size={11} />
                      RMSE
                    </span>

                    <strong>{model.rmse.toFixed(2)}</strong>
                  </div>
                </div>

                <div className={styles.confidenceHeader}>
                  <span>Skill / Confidence</span>
                  <strong>{model.skill}%</strong>
                </div>

                <div className={styles.confidenceTrack}>
                  <div
                    className={styles.confidenceFill}
                    style={{
                      width: `${model.skill}%`,
                      background: model.color,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CHART + ERROR METRICS */}
        <section className={styles.bottomGrid}>
          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>{VARIABLE_LABELS[variable]} Comparison</h2>

                <p>
                  Current forecast · {UNIT_LABELS[variable]} · {validTime}
                </p>
              </div>

              <span className={styles.panelTag}>
                {REGION_LABELS[region]}
              </span>
            </div>

            <div className={styles.lineChart}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="model"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="rmse"
                    name="RMSE"
                    fill="#2474d2"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Error Metrics</h2>
                <p>Current model skill metrics</p>
              </div>

              <span className={styles.panelTag}>Latest</span>
            </div>

            <div className={styles.errorList}>
              {visibleModels.map((model) => (
                <div className={styles.errorRow} key={model.code}>
                  <div className={styles.errorModel}>
                    <i
                      className={styles.modelDot}
                      style={{ background: model.color }}
                    />

                    <span>{model.code}</span>
                  </div>

                  <strong>{model.rmse.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SELECTED FORECAST */}
        <section className={styles.detailsPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Selected Forecast</h2>
              <p>Hardcoded local model comparison</p>
            </div>

            <button
              type="button"
              className={styles.textButton}
              onClick={() => router.push("/forecasts")}
            >
              Open Forecasts
              <ArrowRight size={13} />
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div>
              <span>Blended Value</span>
              <strong>
                {blendedValue.toFixed(1)} {UNIT_LABELS[variable]}
              </strong>
            </div>

            <div>
              <span>Spread Indicator</span>
              <strong>1.20</strong>
            </div>

            <div>
              <span>Weighting Strategy</span>
              <strong>INVERSE_ERROR</strong>
            </div>

            <div>
              <span>Valid Time</span>
              <strong>{validTime}</strong>
            </div>

            <div>
              <span>Status</span>

              <strong className={styles.completedStatus}>
                <CheckCircle2 size={12} />
                COMPLETED
              </strong>
            </div>

            <div>
              <span>Last Updated</span>
              <strong>{lastUpdated}</strong>
            </div>
          </div>
        </section>

        <div className={styles.footnote}>
          Demo mode: model values, weights and skill metrics are currently
          hardcoded for UI development.
        </div>
      </div>
    </main>
  );
}