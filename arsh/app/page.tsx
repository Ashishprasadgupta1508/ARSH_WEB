"use client";

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Database,
  Info,
  Layers3,
  Minus,
  Plus,
  RefreshCw,
  Wind,
} from "lucide-react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import {
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import styles from "./dashboard.module.css";

import {
  demoEvents,
  demoHealth,
  demoSkill,
  getDemoDetail,
  getDemoRuns,
} from "../lib/demo-data";

/* =========================================================
   TYPES
========================================================= */

type TimeRange =
  | "24h"
  | "48h"
  | "72h"
  | "7d";

type VariableCode =
  | "T2M"
  | "RR"
  | "WSPD";

type ModelCode =
  | "BLENDED"
  | "ECMWF"
  | "GFS"
  | "ICON"
  | "JMA";

type HealthData = {
  application?: string;
  status?: string;
  healthy?: boolean;
  environment?: string;
  runtime?: string;
  timestampUtc?: string;
};

type BlendRun = {
  blendRunId?: string;
  id?: string;
  status?: string;
  variableCode?: string;
  validAt?: string;
  blendedValue?: number;
  canonicalUnit?: string;
  spreadIndicator?: number;
  weightingStrategy?: string;
  participatingModels?: unknown[];
  createdAt?: string;
};

type BlendDetail = BlendRun & {
  models?: unknown[];

  modelContributions?: unknown[];

  weights?: unknown[];

  blendedForecast?: {
    value?: number;
    spreadIndicator?: number;
    canonicalUnit?: string;
  };
};

type SkillMetric = {
  sourceCode?: string;
  sourceName?: string;
  modelName?: string;
  mae?: number;
  rmse?: number;
  bias?: number;
  correlation?: number;
};

type ExtremeEvent = {
  id?: string;
  eventType?: string;
  severity?: string;
  regionCode?: string;
  regionName?: string;
  triggeredAt?: string;
  validAt?: string;
};

type DashboardState = {
  health: HealthData | null;
  runs: BlendRun[];
  latestRun: BlendDetail | null;
  skill: SkillMetric[];
  events: ExtremeEvent[];
};

/* =========================================================
   CONSTANTS
========================================================= */

const MODEL_COLORS: Record<string, string> = {
  ECMWF: "#2474d2",
  OPEN_METEO_ECMWF: "#2474d2",

  GFS: "#e9a414",
  OPEN_METEO_GFS: "#e9a414",

  ICON: "#22a06b",
  OPEN_METEO_ICON: "#22a06b",

  JMA: "#7657d7",
  OPEN_METEO_JMA: "#7657d7",

  BLENDED: "#193b60",
  Blended: "#193b60",
};

/* =========================================================
   HELPERS
========================================================= */

function getRunId(
  run: BlendRun | null,
): string | null {
  if (!run) {
    return null;
  }

  return run.blendRunId || run.id || null;
}

function getModelName(
  value: unknown,
): string {
  if (typeof value === "string") {
    return value
      .replace("OPEN_METEO_", "")
      .replaceAll("_", " ");
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const item =
      value as Record<string, unknown>;

    const raw =
      item.modelName ??
      item.sourceName ??
      item.sourceCode ??
      item.name;

    if (typeof raw === "string") {
      return raw
        .replace("OPEN_METEO_", "")
        .replaceAll("_", " ");
    }
  }

  return "Unknown";
}

function getModelColor(
  value: unknown,
): string {
  const name = getModelName(value);

  const direct =
    MODEL_COLORS[name];

  if (direct) {
    return direct;
  }

  const normalized =
    name.toUpperCase();

  return (
    MODEL_COLORS[normalized] ||
    "#64748b"
  );
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  )}, ${date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    },
  )} UTC`;
}

function formatNumber(
  value: unknown,
  digits = 1,
): string {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(digits);
}

function getMetricValue(
  metric: SkillMetric,
  key: keyof SkillMetric,
): string {
  const value = metric[key];

  if (typeof value !== "number") {
    return "—";
  }

  return value.toFixed(2);
}

function getLatestRun(
  runs: BlendRun[],
): BlendRun | null {
  if (!runs.length) {
    return null;
  }

  return [...runs].sort(
    (a, b) => {
      const aTime = new Date(
        a.validAt ||
          a.createdAt ||
          0,
      ).getTime();

      const bTime = new Date(
        b.validAt ||
          b.createdAt ||
          0,
      ).getTime();

      return bTime - aTime;
    },
  )[0];
}

function getUnit(
  unit?: string,
  variable?: VariableCode,
): string {
  if (unit) {
    const normalized =
      unit.toLowerCase();

    if (
      normalized === "c" ||
      normalized.includes("celsius")
    ) {
      return "°C";
    }

    if (
      normalized === "mm" ||
      normalized.includes("millimeter")
    ) {
      return "mm";
    }

    if (
      normalized.includes("m/s") ||
      normalized.includes(
        "meter per second",
      )
    ) {
      return "m/s";
    }

    return unit;
  }

  if (variable === "RR") {
    return "mm";
  }

  if (variable === "WSPD") {
    return "m/s";
  }

  return "°C";
}

function getVariableLabel(
  variable: VariableCode,
): string {
  if (variable === "RR") {
    return "Rainfall";
  }

  if (variable === "WSPD") {
    return "Wind Speed";
  }

  return "Temperature";
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const router = useRouter();
  const initialRuns = getDemoRuns("T2M");
  const initialLatestRun = getLatestRun(initialRuns);

  const [range, setRange] =
    useState<TimeRange>("24h");

  const [variable, setVariable] =
    useState<VariableCode>("T2M");

  const [model, setModel] =
    useState<ModelCode>("BLENDED");

  const [region, setRegion] =
    useState("GLOBAL");

  const [zoom, setZoom] =
    useState(1);

  const [showLayers, setShowLayers] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [traceId, setTraceId] =
    useState<string | null>(null);

  const [state, setState] =
    useState<DashboardState>(() => ({
      health: demoHealth,
      runs: initialRuns,
      latestRun: initialLatestRun
        ? getDemoDetail(getRunId(initialLatestRun) ?? "")
        : null,
      skill: demoSkill,
      events: demoEvents,
    }));

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async (
  isRefresh = false,
) => {
  if (isRefresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  setError(null);
  setTraceId(null);

  const runs = getDemoRuns(variable);
  const latestRun = getLatestRun(runs);
  const latestId = getRunId(latestRun);

  setState({
    health: demoHealth,
    runs,
    latestRun: latestId ? getDemoDetail(latestId) : null,
    skill: demoSkill,
    events: demoEvents,
  });
  setLoading(false);
  setRefreshing(false);
};
  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const latest =
    state.latestRun;

  const latestValidAt =
    latest?.validAt;

  const isHealthy =
    state.health?.healthy === true;

  const dataStatusLabel =
    isHealthy
      ? "Local data ready"
      : loading
        ? "Loading demo data..."
        : "Local data unavailable";

  /* =======================================================
     WEIGHTS
  ======================================================= */

  const weights = useMemo(() => {
    const raw =
      latest?.weights;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item) => {
        if (
          !item ||
          typeof item !== "object"
        ) {
          return null;
        }

        const record =
          item as Record<
            string,
            unknown
          >;

        const rawName =
          record.sourceCode ??
          record.sourceName ??
          record.modelName ??
          record.name ??
          "Unknown";

        const name =
          typeof rawName === "string"
            ? rawName
                .replace(
                  "OPEN_METEO_",
                  "",
                )
                .replaceAll(
                  "_",
                  " ",
                )
            : "Unknown";

        const rawWeight =
          record.normalizedWeight ??
          record.weight ??
          record.value;

        if (
          typeof rawWeight !==
          "number"
        ) {
          return null;
        }

        const value =
          rawWeight <= 1
            ? rawWeight * 100
            : rawWeight;

        return {
          name,
          value,
          color:
            getModelColor(name),
        };
      })
      .filter(
        (
          item,
        ): item is {
          name: string;
          value: number;
          color: string;
        } => item !== null,
      );
  }, [latest]);

  /* =======================================================
     MODEL ROWS
  ======================================================= */

  const modelRows = useMemo(() => {
    const raw =
      latest?.participatingModels ??
      latest?.models ??
      latest?.modelContributions;

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map(
      (item, index) => {
        const name =
          getModelName(item);

        const color =
          getModelColor(item);

        let temperature:
          | number
          | null = null;

        let rainfall:
          | number
          | null = null;

        let wind:
          | number
          | null = null;

        if (
          item &&
          typeof item === "object"
        ) {
          const record =
            item as Record<
              string,
              unknown
            >;

          const temp =
            record.temperature ??
            record.temperatureValue ??
            record.value ??
            record.blendedValue;

          const rain =
            record.rainfall ??
            record.rainfallValue;

          const windValue =
            record.wind ??
            record.windSpeed;

          if (
            typeof temp ===
            "number"
          ) {
            temperature = temp;
          }

          if (
            typeof rain ===
            "number"
          ) {
            rainfall = rain;
          }

          if (
            typeof windValue ===
            "number"
          ) {
            wind = windValue;
          }
        }

        return {
          id: `${name}-${index}`,
          name,
          temperature,
          rainfall,
          wind,
          color,
        };
      },
    );
  }, [latest]);

  /* =======================================================
     BLENDED VALUES
  ======================================================= */

  const blendedValue =
    latest?.blendedForecast
      ?.value ??
    latest?.blendedValue;

  const spread =
    latest?.blendedForecast
      ?.spreadIndicator ??
    latest?.spreadIndicator;

  const blendedUnit =
    latest?.blendedForecast
      ?.canonicalUnit ??
    latest?.canonicalUnit;

  const displayUnit =
    getUnit(
      blendedUnit,
      variable,
    );

  const strategy =
    latest?.weightingStrategy ||
    "—";

  const participatingCount =
    latest?.participatingModels
      ?.length ||
    latest?.models?.length ||
    modelRows.length ||
    weights.length ||
    0;

  const visibleSkill =
    state.skill.slice(0, 4);

  const visibleEvents =
    state.events.slice(0, 3);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="content">
      <div className={styles.dashboard}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className={
            styles.pageHeader
          }
        >
          <div>
            <div
              className={
                styles.breadcrumb
              }
            >
              ARSH{" "}
              <span>/</span>{" "}
              Dashboard
            </div>

            <h1>
              Dashboard
            </h1>

            <p>
              Overview of multi-model
              weather forecasting and
              blending system
            </p>
          </div>

          <div
            className={
              styles.headerActions
            }
          >
            {(
              [
                "24h",
                "48h",
                "72h",
                "7d",
              ] as TimeRange[]
            ).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    range === item
                      ? styles.timeButtonActive
                      : ""
                  }
                  onClick={() =>
                    setRange(item)
                  }
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className={
              styles.errorBanner
            }
          >
            <div>
              <strong>
                Unable to load
                dashboard data.
              </strong>

              <span>
                {error}
              </span>

              {traceId && (
                <small>
                  Reference trace:{" "}
                  {traceId}
                </small>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                void loadDashboard(
                  true,
                )
              }
            >
              <RefreshCw
                size={14}
              />

              Retry
            </button>
          </div>
        )}

        {/* =================================================
            STATUS CARDS
        ================================================= */}

        <section
          className={
            styles.statusGrid
          }
        >

          {/* LOCAL DATA */}

          <div
            className={
              styles.statusCard
            }
          >
            <div
              className={`${styles.statusIcon} ${styles.blue}`}
            >
              <Database
                size={17}
              />
            </div>

            <div
              className={
                styles.statusCardContent
              }
            >
              <span>
                Data Status
              </span>

              <strong>
                <i
                  className={
                    isHealthy
                      ? styles.greenDot
                      : styles.redDot
                  }
                />

                {dataStatusLabel}
              </strong>

              <small>
                Local demo dataset
              </small>
            </div>
          </div>

          {/* UPDATE */}

          <div
            className={
              styles.statusCard
            }
          >
            <div
              className={`${styles.statusIcon} ${styles.orange}`}
            >
              <RefreshCw
                size={17}
              />
            </div>

            <div
              className={
                styles.statusCardContent
              }
            >
              <span>
                Last Data Update
              </span>

              <strong>
                {formatDate(
                  latestValidAt,
                )}
              </strong>

              <small>
                Demo forecast valid time
              </small>
            </div>
          </div>

          {/* ENVIRONMENT */}

          <div
            className={
              styles.statusCard
            }
          >
            <div
              className={`${styles.statusIcon} ${styles.purple}`}
            >
              <Layers3
                size={17}
              />
            </div>

            <div
              className={
                styles.statusCardContent
              }
            >
              <span>
                Environment
              </span>

              <strong>
                {state.health
                  ?.environment ||
                  "Production"}
              </strong>

              <small>
                Local demo dataset
              </small>
            </div>
          </div>

          {/* SYSTEM */}

          <div
            className={
              styles.statusCard
            }
          >
            <div
              className={`${styles.statusIcon} ${styles.green}`}
            >
              <Activity
                size={17}
              />
            </div>

            <div
              className={
                styles.statusCardContent
              }
            >
              <span>
                System Status
              </span>

              <strong>
                {isHealthy
                  ? "Healthy"
                  : "Unavailable"}
              </strong>

              <small>
                {isHealthy
                  ? "All services operational"
                  : "Showing local demo records"}
              </small>
            </div>
          </div>
        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <section
          className={
            styles.mainGrid
          }
        >

          {/* =================================================
              FORECAST MAP
          ================================================= */}

          <div
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <h2>
                  Forecast Map{" "}
                  <Info size={14} />
                </h2>

                <p>
                  Blended forecast
                  across the selected
                  region
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.textButton
                }
                onClick={() =>
                  void loadDashboard(
                    true,
                  )
                }
              >
                <RefreshCw
                  size={12}
                  className={
                    refreshing
                      ? styles.spin
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* MAP CONTROLS */}

            <div
              className={
                styles.forecastControls
              }
            >
              <div>
                <label>
                  Variable
                </label>

                <select
                  value={variable}
                  onChange={(event) => {
                    const nextVariable = event.target.value as VariableCode;
                    const nextRuns = getDemoRuns(nextVariable);
                    const latestRun = getLatestRun(nextRuns);
                    const latestId = getRunId(latestRun);
                    setVariable(nextVariable);
                    setState((current) => ({
                      ...current,
                      runs: nextRuns,
                      latestRun: latestId ? getDemoDetail(latestId) : null,
                    }));
                  }}
                >
                  <option value="T2M">
                    Temperature (T2M)
                  </option>

                  <option value="RR">
                    Rainfall (RR)
                  </option>

                  <option value="WSPD">
                    Wind Speed (WSPD)
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Model
                </label>

                <select
                  value={model}
                  onChange={(event) =>
                    setModel(
                      event.target
                        .value as ModelCode,
                    )
                  }
                >
                  <option value="BLENDED">
                    Blended
                  </option>

                  <option value="ECMWF">
                    ECMWF
                  </option>

                  <option value="GFS">
                    GFS
                  </option>

                  <option value="ICON">
                    ICON
                  </option>

                  <option value="JMA">
                    JMA
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Region
                </label>

                <select
                  value={region}
                  onChange={(event) =>
                    setRegion(
                      event.target.value,
                    )
                  }
                >
                  <option value="GLOBAL">
                    Global
                  </option>

                  <option value="INDIA">
                    India
                  </option>

                  <option value="NORTH_INDIA">
                    North India
                  </option>

                  <option value="CENTRAL_INDIA">
                    Central India
                  </option>

                  <option value="WEST_INDIA">
                    West India
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Valid Time
                </label>

                <button
                  type="button"
                  className={
                    styles.validTimeButton
                  }
                  onClick={() =>
                    void loadDashboard(
                      true,
                    )
                  }
                >
                  <span>
                    <CalendarDays
                      size={13}
                    />

                    {formatDate(
                      latestValidAt,
                    )}
                  </span>

                  <ChevronDown
                    size={14}
                  />
                </button>
              </div>
            </div>

            {/* MAP */}

            <div
              className={
                styles.mapContainer
              }
            >
              <div
                className={
                  styles.mapBackground
                }
                style={{
                  transform: `scale(${zoom})`,
                  transition:
                    "transform 180ms ease",
                }}
              >
                <div
                  className={
                    styles.mapGlowOne
                  }
                />

                <div
                  className={
                    styles.mapGlowTwo
                  }
                />

                <div
                  className={
                    styles.mapGlowThree
                  }
                />

                <div
                  className={
                    styles.mapShape
                  }
                >
                  <div
                    className={
                      styles.indiaShape
                    }
                  >
                    <span
                      className={`${styles.mapState} ${styles.stateOne}`}
                    />

                    <span
                      className={`${styles.mapState} ${styles.stateTwo}`}
                    />

                    <span
                      className={`${styles.mapState} ${styles.stateThree}`}
                    />

                    <span
                      className={`${styles.mapState} ${styles.stateFour}`}
                    />

                    <span
                      className={`${styles.mapState} ${styles.stateFive}`}
                    />

                    <span
                      className={`${styles.mapState} ${styles.stateSix}`}
                    />
                  </div>

                  <span
                    className={`${styles.countryLabel} ${styles.pakistan}`}
                  >
                    PAKISTAN
                  </span>

                  <span
                    className={`${styles.countryLabel} ${styles.nepal}`}
                  >
                    NEPAL
                  </span>

                  <span
                    className={`${styles.countryLabel} ${styles.china}`}
                  >
                    CHINA
                  </span>

                  <span
                    className={`${styles.countryLabel} ${styles.bangladesh}`}
                  >
                    BANGLADESH
                  </span>

                  <span
                    className={`${styles.countryLabel} ${styles.myanmar}`}
                  >
                    MYANMAR
                  </span>

                  <span
                    className={`${styles.countryLabel} ${styles.sriLanka}`}
                  >
                    SRI LANKA
                  </span>

                  <span
                    className={`${styles.seaLabel} ${styles.arabianSea}`}
                  >
                    Arabian Sea
                  </span>

                  <span
                    className={`${styles.seaLabel} ${styles.bayBengal}`}
                  >
                    Bay of Bengal
                  </span>
                </div>

                {/* ZOOM */}

                <div
                  className={
                    styles.zoomControls
                  }
                >
                  <button
                    type="button"
                    aria-label="Zoom in"
                    onClick={() =>
                      setZoom(
                        (value) =>
                          Math.min(
                            value +
                              0.1,
                            1.8,
                          ),
                      )
                    }
                  >
                    <Plus size={15} />
                  </button>

                  <button
                    type="button"
                    aria-label="Zoom out"
                    onClick={() =>
                      setZoom(
                        (value) =>
                          Math.max(
                            value -
                              0.1,
                            0.8,
                          ),
                      )
                    }
                  >
                    <Minus size={15} />
                  </button>
                </div>

                {/* LAYERS */}

                <button
                  type="button"
                  className={
                    styles.layerButton
                  }
                  aria-label="Toggle map layers"
                  aria-pressed={
                    showLayers
                  }
                  onClick={() =>
                    setShowLayers(
                      (value) =>
                        !value,
                    )
                  }
                >
                  <Layers3 size={15} />
                </button>

                {showLayers && (
                  <div className={styles.layerPanel}>
                    <strong>
                      Map Layers
                    </strong>

                    <label>
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Forecast
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Borders
                    </label>

                    <label>
                      <input type="checkbox" />
                      Grid
                    </label>
                  </div>
                )}

                {/* MAP INFO */}

                <div
                  className={
                    styles.mapInfo
                  }
                >
                  <strong>
                    Valid:{" "}
                    {formatDate(
                      latestValidAt,
                    )}
                  </strong>

                  <span>
                    Model:{" "}
                    {model ===
                    "BLENDED"
                      ? "Blended"
                      : model}
                  </span>

                  <span>
                    Region:{" "}
                    {region}
                  </span>
                </div>

                {/* LEGEND */}

                <div
                  className={
                    styles.temperatureLegend
                  }
                >
                  <strong>
                    {getUnit(
                      blendedUnit,
                      variable,
                    )}
                  </strong>

                  <div
                    className={
                      styles.legendScale
                    }
                  />

                  <div
                    className={
                      styles.legendNumbers
                    }
                  >
                    {[
                      45,
                      40,
                      35,
                      30,
                      25,
                      20,
                      15,
                      10,
                      5,
                      0,
                    ].map(
                      (value) => (
                        <span
                          key={value}
                        >
                          {value}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              LATEST FORECAST
          ================================================= */}

          <div
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <h2>
                  Latest Forecast
                  (Blended)
                </h2>

                <p>
                  {formatDate(
                    latestValidAt,
                  )}
                </p>
              </div>

              <span
                className={
                  styles.completedBadge
                }
              >
                <CheckCircle2
                  size={12}
                />

                {latest?.status ||
                  "NO DATA"}
              </span>
            </div>

            <div
              className={
                styles.forecastMetrics
              }
            >
              {/* PRIMARY */}

              <div
                className={
                  styles.forecastMetric
                }
              >
                <div
                  className={`${styles.forecastMetricIcon} ${styles.blue}`}
                >
                  {variable ===
                  "T2M"
                    ? "°"
                    : variable ===
                        "RR"
                      ? "R"
                      : "W"}
                </div>

                <span>
                  {getVariableLabel(
                    variable,
                  )}{" "}
                  ({variable})
                </span>

                <strong>
                  {formatNumber(
                    blendedValue,
                  )}

                  <small>
                    {displayUnit}
                  </small>
                </strong>

                <small>
                  Spread:{" "}
                  {formatNumber(
                    spread,
                  )}{" "}
                  {displayUnit}
                </small>
              </div>

              {/* RAIN */}

              <div
                className={
                  styles.forecastMetric
                }
              >
                <div
                  className={`${styles.forecastMetricIcon} ${styles.green}`}
                >
                  <CloudRain
                    size={18}
                  />
                </div>

                <span>
                  Rainfall (RR)
                </span>

                <strong>
                  —
                  <small>
                    mm
                  </small>
                </strong>

                <small>
                  Separate RR
                  run required
                </small>
              </div>

              {/* WIND */}

              <div
                className={
                  styles.forecastMetric
                }
              >
                <div
                  className={`${styles.forecastMetricIcon} ${styles.purple}`}
                >
                  <Wind
                    size={18}
                  />
                </div>

                <span>
                  Wind Speed
                  (WSPD)
                </span>

                <strong>
                  —
                  <small>
                    m/s
                  </small>
                </strong>

                <small>
                  Separate WSPD
                  run required
                </small>
              </div>
            </div>

            {/* DETAILS */}

            <div
              className={
                styles.forecastDetails
              }
            >
              <div>
                <span>
                  Weighting Strategy
                </span>

                <strong>
                  {strategy}
                </strong>
              </div>

              <div>
                <span>
                  Participating Models
                </span>

                <strong
                  className={
                    styles.modelDots
                  }
                >
                  {weights.map(
                    (item) => (
                      <i
                        key={
                          item.name
                        }
                        style={{
                          background:
                            item.color,
                        }}
                        title={
                          item.name
                        }
                      />
                    ),
                  )}

                  <em>
                    {participatingCount ||
                      "—"}{" "}
                    Models
                  </em>
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong
                  className={
                    styles.statusCompleted
                  }
                >
                  <CheckCircle2
                    size={12}
                  />

                  {latest?.status ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Valid Time
                </span>

                <strong>
                  {formatDate(
                    latestValidAt,
                  )}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MODEL COMPARISON
        ================================================= */}

        <section
          className={
            styles.panel
          }
        >
          <div
            className={
              styles.panelHeader
            }
          >
            <div>
              <h2>
                Model Comparison
                (Current Forecast)
              </h2>

              <p>
                Current output from
                participating
                forecast models
              </p>
            </div>

            <button
              type="button"
              className={
                styles.textButton
              }
              onClick={() =>
                router.push(
                  "/models",
                )
              }
            >
              View Details →
            </button>
          </div>

          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={
                styles.table
              }
            >
              <thead>
                <tr>
                  <th>
                    Model
                  </th>

                  <th>
                    Temperature
                    (°C)
                  </th>

                  <th>
                    Rainfall
                    (mm)
                  </th>

                  <th>
                    Wind Speed
                    (m/s)
                  </th>

                  <th>
                    Δ from
                    Blend
                  </th>
                </tr>
              </thead>

              <tbody>
                {modelRows.length >
                0 ? (
                  modelRows.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td>
                          <span
                            className={
                              styles.tableModel
                            }
                          >
                            <i
                              style={{
                                background:
                                  item.color,
                              }}
                            />

                            {
                              item.name
                            }
                          </span>
                        </td>

                        <td>
                          {formatNumber(
                            item.temperature,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            item.rainfall,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            item.wind,
                          )}
                        </td>

                        <td>
                          —
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                    >
                      No model contribution data is available in this demo run.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* =================================================
            BOTTOM GRID
        ================================================= */}

        <section
          className={
            styles.bottomGrid
          }
        >

          {/* =================================================
              WEIGHTS
          ================================================= */}

          <div
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <h2>
                  Adaptive Model
                  Weights
                </h2>

                <p>
                  Current contribution
                  to the blended
                  forecast
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.textButton
                }
                onClick={() =>
                  router.push(
                    "/weights",
                  )
                }
              >
                View Details →
              </button>
            </div>

            <div
              className={
                styles.weightsContent
              }
            >
              <div
                className={
                  styles.donutChart
                }
              >
                {weights.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={
                          weights
                        }
                        dataKey="value"
                        nameKey="name"
                        innerRadius={
                          52
                        }
                        outerRadius={
                          73
                        }
                        paddingAngle={
                          2
                        }
                      >
                        {weights.map(
                          (
                            item,
                          ) => (
                            <Cell
                              key={
                                item.name
                              }
                              fill={
                                item.color
                              }
                            />
                          ),
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div>
                    No data
                  </div>
                )}

                <div
                  className={
                    styles.donutLabel
                  }
                >
                  <strong>
                    Model
                  </strong>

                  <span>
                    Weights
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.weightList
                }
              >
                {weights.map(
                  (item) => (
                    <div
                      className={
                        styles.weightItem
                      }
                      key={
                        item.name
                      }
                    >
                      <span>
                        <i
                          style={{
                            background:
                              item.color,
                          }}
                        />

                        {
                          item.name
                        }
                      </span>

                      <strong>
                        {item.value.toFixed(
                          0,
                        )}
                        %
                      </strong>
                    </div>
                  ),
                )}

                <div
                  className={
                    styles.strategyLine
                  }
                >
                  <span>
                    Strategy
                  </span>

                  <strong>
                    {strategy}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              SKILL
          ================================================= */}

          <div
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <h2>
                  Skill Metrics
                  (Latest)
                </h2>

                <p>
                  Recent validation
                  performance
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.textButton
                }
                onClick={() =>
                  router.push(
                    "/skill",
                  )
                }
              >
                View Details →
              </button>
            </div>

            <div
              className={
                styles.smallTableWrapper
              }
            >
              <table
                className={
                  styles.smallTable
                }
              >
                <thead>
                  <tr>
                    <th>
                      Model
                    </th>

                    <th>
                      MAE
                    </th>

                    <th>
                      RMSE
                    </th>

                    <th>
                      Bias
                    </th>

                    <th>
                      Corr.
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visibleSkill.length >
                  0 ? (
                    visibleSkill.map(
                      (
                        metric,
                        index,
                      ) => (
                        <tr
                          key={`${metric.sourceCode || metric.modelName || "model"}-${index}`}
                        >
                          <td>
                            {metric.sourceName ||
                              metric.modelName ||
                              metric.sourceCode ||
                              "—"}
                          </td>

                          <td>
                            {getMetricValue(
                              metric,
                              "mae",
                            )}
                          </td>

                          <td>
                            {getMetricValue(
                              metric,
                              "rmse",
                            )}
                          </td>

                          <td>
                            {getMetricValue(
                              metric,
                              "bias",
                            )}
                          </td>

                          <td>
                            {getMetricValue(
                              metric,
                              "correlation",
                            )}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                      >
                        No skill
                        metrics
                        returned.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================
              EXTREME WEATHER
          ================================================= */}

          <div
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <h2>
                  Recent Extreme
                  Weather Events
                </h2>

                <p>
                  Computed guidance
                  from latest
                  forecast data
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.textButton
                }
                onClick={() =>
                  router.push(
                    "/extreme-weather",
                  )
                }
              >
                View All →
              </button>
            </div>

            <div
              className={
                styles.eventsList
              }
            >
              {visibleEvents.length >
              0 ? (
                visibleEvents.map(
                  (
                    event,
                    index,
                  ) => (
                    <div
                      className={
                        styles.eventRow
                      }
                      key={
                        event.id ||
                        `${event.eventType}-${index}`
                      }
                    >
                      <div
                        className={
                          styles.eventIcon
                        }
                      >
                        <AlertTriangle
                          size={14}
                        />
                      </div>

                      <div
                        className={
                          styles.eventMain
                        }
                      >
                        <strong>
                          {event.eventType ||
                            "Weather Event"}
                        </strong>

                        <span>
                          {event.regionName ||
                            event.regionCode ||
                            "—"}
                        </span>
                      </div>

                      <span
                        className={`${styles.severity} ${
                          event.severity ===
                          "SEVERE"
                            ? styles.severe
                            : styles.moderate
                        }`}
                      >
                        {event.severity ||
                          "—"}
                      </span>

                      <span
                        className={
                          styles.eventTime
                        }
                      >
                        {formatDate(
                          event.validAt ||
                            event.triggeredAt,
                        )}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  No extreme-weather
                  events returned.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <div
          className={
            styles.disclaimer
          }
        >
          <AlertTriangle
            size={14}
          />

          <span>
            <strong>
              COMPUTED GUIDANCE /
              DECISION SUPPORT
            </strong>

            {" — "}

            Not an official warning
            or advisory.
          </span>
        </div>

      </div>
    </main>
  );
}