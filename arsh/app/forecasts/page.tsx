"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Database,
  RefreshCw,
  Wind,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCallback, useMemo, useState } from "react";

import { getDemoDetail, getDemoRuns } from "../../lib/demo-data";

type BlendRun = {
  blendRunId?: string;
  id?: string;
  blendedForecastId?: string;
  variableCode?: string;
  validAt?: string;
  blendedValue?: number;
  canonicalUnit?: string;
  spreadIndicator?: number;
  weightingStrategy?: string;
  status?: string;
  participatingModels?: unknown[];
  createdAt?: string;
};

type BlendWeight = {
  sourceCode?: string;
  normalizedWeight?: number;
  weight?: number;
};

type ModelContribution = {
  sourceCode?: string;
  model?: string;
  value?: number;
  forecastValue?: number;
  contribution?: number;
};

type ForecastValue = {
  sourceCode?: string;
  rawValue?: number;
  value?: number;
};

type BlendDetail = BlendRun & {
  variable?: {
    code?: string;
    name?: string;
  };

  regionCode?: string;
  region?: string;

  weights?: BlendWeight[];

  modelContributions?: ModelContribution[];

  forecastValues?: ForecastValue[];

  lineage?: unknown;
};

type ModelRow = {
  sourceCode: string;
  name: string;
  color: string;
  value: number | null;
  weight: number | null;
  delta: number | null;
};

const MODEL_META: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  OPEN_METEO_ECMWF: {
    label: "ECMWF",
    color: "#2474d2",
  },

  OPEN_METEO_GFS: {
    label: "GFS",
    color: "#e7a41a",
  },

  OPEN_METEO_ICON: {
    label: "ICON",
    color: "#249b67",
  },

  OPEN_METEO_JMA: {
    label: "JMA",
    color: "#7657d7",
  },
};

const MODEL_ALIASES: Record<string, string> = {
  ECMWF: "OPEN_METEO_ECMWF",
  GFS: "OPEN_METEO_GFS",
  ICON: "OPEN_METEO_ICON",
  JMA: "OPEN_METEO_JMA",
};

function getModelMeta(sourceCode?: string) {
  if (!sourceCode) {
    return {
      label: "Unknown",
      color: "#7b8796",
    };
  }

  const upper = sourceCode.toUpperCase();

  const normalized =
    MODEL_ALIASES[upper] || upper;

  return (
    MODEL_META[normalized] || {
      label: sourceCode.replace("OPEN_METEO_", ""),
      color: "#7b8796",
    }
  );
}

function formatUTC(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "");
}

function formatShortUTC(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "");
}

function getRunId(run?: BlendRun | null) {
  if (!run) {
    return "";
  }

  return run.blendRunId || run.id || "";
}

function getUnit(unit?: string, variable?: string) {
  if (unit) {
    const normalized = unit.toLowerCase();

    if (
      normalized.includes("celsius") ||
      normalized === "c"
    ) {
      return "°C";
    }

    if (
      normalized.includes("millimeter") ||
      normalized === "mm"
    ) {
      return "mm";
    }

    if (
      normalized.includes("m/s") ||
      normalized.includes("meter per second")
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

function getVariableLabel(variable: string) {
  switch (variable) {
    case "T2M":
      return "Temperature · T2M";

    case "RR":
      return "Rainfall · RR";

    case "WSPD":
      return "Wind Speed · WSPD";

    default:
      return variable;
  }
}

function getVariableIcon(variable: string) {
  if (variable === "RR") {
    return <CloudRain size={17} />;
  }

  if (variable === "WSPD") {
    return <Wind size={17} />;
  }

  return "°C";
}

function getModelValue(
  model?:
    | ModelContribution
    | ForecastValue
    | null,
) {
  if (!model) {
    return null;
  }

  if (typeof model.value === "number") {
    return model.value;
  }

  if (
    "forecastValue" in model &&
    typeof model.forecastValue === "number"
  ) {
    return model.forecastValue;
  }

  if (
    "rawValue" in model &&
    typeof model.rawValue === "number"
  ) {
    return model.rawValue;
  }

  return null;
}

function extractModels(
  detail?: BlendDetail | null,
): ModelRow[] {
  if (!detail) {
    return [];
  }

  const contributions = Array.isArray(
    detail.modelContributions,
  )
    ? detail.modelContributions
    : [];

  const forecastValues = Array.isArray(
    detail.forecastValues,
  )
    ? detail.forecastValues
    : [];

  const weights = Array.isArray(detail.weights)
    ? detail.weights
    : [];

  const sourceCodes = new Set<string>();

  for (const item of contributions) {
    if (item?.sourceCode) {
      sourceCodes.add(item.sourceCode);
    }
  }

  for (const item of forecastValues) {
    if (item?.sourceCode) {
      sourceCodes.add(item.sourceCode);
    }
  }

  for (const item of weights) {
    if (item?.sourceCode) {
      sourceCodes.add(item.sourceCode);
    }
  }

  if (
    sourceCodes.size === 0 &&
    Array.isArray(detail.participatingModels)
  ) {
    for (const item of detail.participatingModels) {
      if (typeof item === "string") {
        sourceCodes.add(item);
      } else if (
        item &&
        typeof item === "object" &&
        "sourceCode" in item
      ) {
        const sourceCode = (
          item as {
            sourceCode?: unknown;
          }
        ).sourceCode;

        if (typeof sourceCode === "string") {
          sourceCodes.add(sourceCode);
        }
      }
    }
  }

  const blendedValue =
    typeof detail.blendedValue === "number"
      ? detail.blendedValue
      : null;

  return Array.from(sourceCodes).map(
    (sourceCode) => {
      const contribution =
        contributions.find(
          (item) =>
            item.sourceCode === sourceCode,
        );

      const forecast =
        forecastValues.find(
          (item) =>
            item.sourceCode === sourceCode,
        );

      const weight =
        weights.find(
          (item) =>
            item.sourceCode === sourceCode,
        );

      const value =
        getModelValue(contribution) ??
        getModelValue(forecast);

      const normalizedWeight =
        typeof weight?.normalizedWeight ===
        "number"
          ? weight.normalizedWeight
          : typeof weight?.weight === "number"
            ? weight.weight
            : null;

      const meta =
        getModelMeta(sourceCode);

      const delta =
        value !== null &&
        blendedValue !== null
          ? value - blendedValue
          : null;

      return {
        sourceCode,
        name: meta.label,
        color: meta.color,
        value,
        weight: normalizedWeight,
        delta,
      };
    },
  );
}

export default function ForecastsPage() {
  const [variable, setVariable] =
    useState("T2M");

  const [model, setModel] =
    useState("BLENDED");

  const [region, setRegion] =
    useState("GLOBAL");

  const [runs, setRuns] =
    useState<BlendRun[]>(() => getDemoRuns("T2M"));

  const [selectedRun, setSelectedRun] =
    useState<BlendRun | null>(() => getDemoRuns("T2M")[0] ?? null);

  const [detail, setDetail] =
    useState<BlendDetail | null>(() => {
      const firstRun = getDemoRuns("T2M")[0];
      return firstRun ? getDemoDetail(getRunId(firstRun)) : null;
    });

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [traceId, setTraceId] =
    useState<string | null>(null);

  const loadForecasts = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);
        setTraceId(null);

        const nextRuns = getDemoRuns(variable);

        setRuns(nextRuns);

        const sortedRuns =
          [...nextRuns].sort(
            (a, b) => {
              const aTime = a.validAt
                ? new Date(
                    a.validAt,
                  ).getTime()
                : 0;

              const bTime = b.validAt
                ? new Date(
                    b.validAt,
                  ).getTime()
                : 0;

              return bTime - aTime;
            },
          );

        const latest =
          sortedRuns[0] || null;

        setSelectedRun(latest);

        if (latest) {
          const runId =
            getRunId(latest);

          if (runId) {
            setDetail(getDemoDetail(runId));
          } else {
            setDetail(null);
          }
        } else {
          setDetail(null);
        }
      } catch (err) {
        console.error(
          "Forecast loading error:",
          err,
        );
        setError("Unable to load local forecast data.");

        setRuns([]);
        setSelectedRun(null);
        setDetail(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [variable],
  );

  const latest =
    detail || selectedRun;

  const availableValidTimes =
    useMemo(() => {
      return [...runs]
        .filter(
          (run) =>
            Boolean(run.validAt),
        )
        .sort((a, b) => {
          return (
            new Date(
              b.validAt!,
            ).getTime() -
            new Date(
              a.validAt!,
            ).getTime()
          );
        });
    }, [runs]);

  const timelineData =
    useMemo(() => {
      return availableValidTimes
        .slice(0, 16)
        .reverse()
        .map((run) => ({
          time: formatShortUTC(
            run.validAt,
          ),

          value:
            typeof run.blendedValue ===
            "number"
              ? run.blendedValue
              : null,
        }));
    }, [availableValidTimes]);

  const modelData =
    useMemo(() => {
      return extractModels(detail);
    }, [detail]);

  const participatingCount =
    modelData.length ||
    (Array.isArray(
      latest?.participatingModels,
    )
      ? latest.participatingModels.length
      : 0);

  const unit = getUnit(
    latest?.canonicalUnit,
    variable,
  );

  const regionLabel =
    detail?.regionCode ||
    detail?.region ||
    (region === "GLOBAL"
      ? "Global"
      : region);

  function selectRun(runId: string) {
    const run = runs.find(
      (item) =>
        getRunId(item) === runId,
    );

    if (!run) {
      return;
    }

    setSelectedRun(run);

    const id = getRunId(run);

    if (!id) {
      return;
    }

    setError(null);
    setTraceId(null);
    setDetail(getDemoDetail(id));
  }

  return (
    <main className="content">
      <div className="forecast-page">

        {/* ================= HEADER ================= */}

        <div className="forecast-heading">
          <div>
            <div className="breadcrumb">
              ARSH <span>/</span> Forecasts
            </div>

            <h1>Forecasts</h1>

            <p>
              Multi-model forecast data and
              blended prediction for the
              selected region and time.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() =>
              void loadForecasts(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="forecast-error">
            <div>
              <AlertTriangle
                size={16}
              />

              <div>
                <strong>
                  Local forecast data unavailable
                </strong>

                <p>{error}</p>

                {traceId && (
                  <small>
                    Trace ID: {traceId}
                  </small>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadForecasts(true)
              }
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= CONTROLS ================= */}

        <div className="forecast-controls">

          {/* VARIABLE */}

          <div className="forecast-select">
            <span>Variable</span>

            <div className="select-wrapper">
              <select
                value={variable}
                onChange={(event) => {
                  const nextVariable = event.target.value;
                  setVariable(nextVariable);
                  const nextRuns = getDemoRuns(nextVariable);
                  const latestRun = nextRuns[0] ?? null;
                  setRuns(nextRuns);
                  setSelectedRun(latestRun);
                  setDetail(latestRun ? getDemoDetail(getRunId(latestRun)) : null);
                }}
              >
                <option value="T2M">
                  Temperature · T2M
                </option>

                <option value="RR">
                  Rainfall · RR
                </option>

                <option value="WSPD">
                  Wind Speed · WSPD
                </option>
              </select>

              <ChevronDown
                size={14}
              />
            </div>
          </div>

          {/* MODEL */}

          <div className="forecast-select">
            <span>Model</span>

            <div className="select-wrapper">
              <select
                value={model}
                onChange={(event) =>
                  setModel(
                    event.target.value,
                  )
                }
              >
                <option value="BLENDED">
                  Blended Forecast
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

              <ChevronDown
                size={14}
              />
            </div>
          </div>

          {/* REGION */}

          <div className="forecast-select">
            <span>Region</span>

            <div className="select-wrapper">
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

                <option value="NORTH_INDIA">
                  North India
                </option>

                <option value="CENTRAL_INDIA">
                  Central India
                </option>

                <option value="WEST_INDIA">
                  West India
                </option>

                <option value="EAST_INDIA">
                  East India
                </option>
              </select>

              <ChevronDown
                size={14}
              />
            </div>
          </div>

          {/* VALID TIME */}

          <div className="forecast-select">
            <span>Valid Time</span>

            <div className="select-wrapper">
              <CalendarDays
                size={13}
              />

              <select
                value={
                  selectedRun
                    ? getRunId(
                        selectedRun,
                      )
                    : ""
                }
                onChange={(event) =>
                  void selectRun(
                    event.target.value,
                  )
                }
              >
                {availableValidTimes.length ===
                0 ? (
                  <option value="">
                    No forecast runs
                  </option>
                ) : (
                  availableValidTimes.map(
                    (run) => {
                      const id =
                        getRunId(run);

                      return (
                        <option
                          key={id}
                          value={id}
                        >
                          {formatUTC(
                            run.validAt,
                          )}
                        </option>
                      );
                    },
                  )
                )}
              </select>

              <ChevronDown
                size={14}
              />
            </div>
          </div>
        </div>

        {/* ================= CURRENT FORECAST ================= */}

        <section className="current-forecast">
          {loading ? (
            <div className="forecast-loading">
              <RefreshCw
                size={18}
                className="spin"
              />

              Loading latest forecast...
            </div>
          ) : latest ? (
            <>
              <div className="current-forecast-main">

                <div className="current-label">
                  CURRENT BLENDED FORECAST
                </div>

                <div className="current-value">
                  {typeof latest.blendedValue ===
                  "number"
                    ? latest.blendedValue.toFixed(
                        1,
                      )
                    : "—"}

                  <span>{unit}</span>
                </div>

                <div className="current-meta">
                  <span>
                    {regionLabel}
                  </span>

                  <span>•</span>

                  <span>
                    {formatUTC(
                      latest.validAt,
                    )}{" "}
                    UTC
                  </span>
                </div>
              </div>

              <div className="current-details">

                <div>
                  <span>
                    Spread
                  </span>

                  <strong>
                    {typeof latest.spreadIndicator ===
                    "number"
                      ? `${latest.spreadIndicator.toFixed(
                          1,
                        )} ${unit}`
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Strategy
                  </span>

                  <strong>
                    {latest.weightingStrategy ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Models
                  </span>

                  <strong>
                    {participatingCount
                      ? participatingCount
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong className="forecast-status">
                    <CheckCircle2
                      size={13}
                    />

                    {latest.status ||
                      "—"}
                  </strong>
                </div>

              </div>
            </>
          ) : (
            <div className="forecast-empty">
              <Database size={20} />

              <div>
                <strong>
                  No completed forecast
                  runs found.
                </strong>

                <span>
                  No local completed blend run is available for{" "}
                  {getVariableLabel(
                    variable,
                  )}
                  .
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ================= TIMELINE ================= */}

        <section className="forecast-panel">

          <div className="forecast-panel-header">
            <div>
              <h2>
                Forecast Timeline
              </h2>

              <p>
                {getVariableLabel(
                  variable,
                )}{" "}
                · Available completed
                forecast runs
              </p>
            </div>

            <div className="chart-legend">
              <div className="chart-legend-item strong">
                <i
                  style={{
                    background:
                      "#173b5e",
                  }}
                />

                Blended
              </div>
            </div>
          </div>

          <div className="forecast-chart">
            {timelineData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={timelineData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical
                  />

                  <XAxis
                    dataKey="time"
                    tick={{
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Blended"
                    stroke="#173b5e"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                    }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="forecast-chart-empty">
                <Database size={20} />

                <span>
                  No timeline data is available in the local demo set.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ================= SUMMARY ================= */}

        <section className="forecast-summary-grid">

          <div className="forecast-metric-card">
            <div className="forecast-metric-icon">
              {getVariableIcon(variable)}
            </div>

            <div>
              <span>
                Blended Value
              </span>

              <strong>
                {typeof latest?.blendedValue ===
                "number"
                  ? latest.blendedValue.toFixed(
                      1,
                    )
                  : "—"}
              </strong>

              <small>
                {unit}
              </small>
            </div>
          </div>

          <div className="forecast-metric-card">
            <div className="forecast-metric-icon">
              <CloudRain
                size={17}
              />
            </div>

            <div>
              <span>
                Spread Indicator
              </span>

              <strong>
                {typeof latest?.spreadIndicator ===
                "number"
                  ? latest.spreadIndicator.toFixed(
                      1,
                    )
                  : "—"}
              </strong>

              <small>
                Forecast spread
              </small>
            </div>
          </div>

          <div className="forecast-metric-card">
            <div className="forecast-metric-icon">
              <Wind size={17} />
            </div>

            <div>
              <span>
                Participating Models
              </span>

              <strong>
                {participatingCount ||
                  "—"}
              </strong>

              <small>
                Included in local demo data
              </small>
            </div>
          </div>

          <div className="forecast-info-box">
            <span>
              Weighting Strategy
            </span>

            <strong>
              {latest?.weightingStrategy ||
                "—"}
            </strong>

            <p>
              Local demo blending strategy
            </p>
          </div>

        </section>

        {/* ================= MODEL CONTRIBUTIONS ================= */}

        <section className="forecast-panel model-table-panel">

          <div className="forecast-panel-header">
            <div>
              <h2>
                Model Contributions
              </h2>

              <p>
                Values returned in the
                selected blend lineage
              </p>
            </div>

            <span className="data-label">
              {model === "BLENDED"
                ? "Blended"
                : model}
            </span>
          </div>

          <div className="forecast-table-wrap">
            <table className="forecast-table">

              <thead>
                <tr>
                  <th>
                    Model
                  </th>

                  <th>
                    Forecast Value
                  </th>

                  <th>
                    Weight
                  </th>

                  <th>
                    Δ from Blend
                  </th>
                </tr>
              </thead>

              <tbody>
                {modelData.length > 0 ? (
                  <>
                    {modelData.map(
                      (item) => (
                        <tr
                          key={
                            item.sourceCode
                          }
                        >
                          <td>
                            <span className="model-name">
                              <i
                                className="model-marker"
                                style={{
                                  background:
                                    item.color,
                                }}
                              />

                              {item.name}
                            </span>
                          </td>

                          <td>
                            {item.value !==
                            null
                              ? item.value.toFixed(
                                  2,
                                )
                              : "—"}
                          </td>

                          <td>
                            {item.weight !==
                            null
                              ? `${(
                                  item.weight <=
                                  1
                                    ? item.weight *
                                      100
                                    : item.weight
                                ).toFixed(
                                  1,
                                )}%`
                              : "—"}
                          </td>

                          <td
                            className={
                              item.delta ===
                              null
                                ? ""
                                : item.delta >
                                    0
                                  ? "positive"
                                  : item.delta <
                                      0
                                    ? "negative"
                                    : ""
                            }
                          >
                            {item.delta ===
                            null
                              ? "—"
                              : item.delta ===
                                  0
                                ? "0.00"
                                : `${
                                    item.delta >
                                    0
                                      ? "+"
                                      : ""
                                  }${item.delta.toFixed(
                                    2,
                                  )}`}
                          </td>
                        </tr>
                      ),
                    )}

                    <tr className="blended-table-row">
                      <td>
                        <span className="model-name">
                          <i className="model-marker blended" />

                          Blended
                        </span>
                      </td>

                      <td>
                        {typeof latest?.blendedValue ===
                        "number"
                          ? latest.blendedValue.toFixed(
                              2,
                            )
                          : "—"}
                      </td>

                      <td>
                        —
                      </td>

                      <td>
                        —
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "24px",
                      }}
                    >
                      <div className="table-empty">
                        <Database
                          size={18}
                        />

                        <span>
                          No model contribution details are available for this local demo run.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </section>

        {/* ================= FOOTNOTE ================= */}

        <div className="forecast-footnote">
          Values shown above are hardcoded illustrative demo data. They are not live forecasts.
        </div>

        {/* ================= DISCLAIMER ================= */}

        <div className="forecast-footnote">
          <AlertTriangle size={14} />

          <span>
            <strong>
              COMPUTED GUIDANCE /
              DECISION SUPPORT
            </strong>

            {" — "}
            Not an official warning or
            advisory.
          </span>
        </div>

      </div>
    </main>
  );
}