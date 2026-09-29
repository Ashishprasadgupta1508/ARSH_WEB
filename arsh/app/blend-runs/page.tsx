"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudRain,
  Database,
  Download,
  Filter,
  GitBranch,
  Layers3,
  MoreHorizontal,
  Play,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Timer,
  XCircle,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./blend-runs.module.css";

const runHistory = [
  {
    id: "BR-2026-0927-0842",
    status: "Completed",
    time: "08:42 UTC",
    duration: "02m 18s",
    models: 4,
    confidence: 91,
    forecast: "Clear",
    temp: "28.4°C",
    rainfall: "12%",
  },
  {
    id: "BR-2026-0927-0615",
    status: "Completed",
    time: "06:15 UTC",
    duration: "02m 11s",
    models: 4,
    confidence: 89,
    forecast: "Partly Cloudy",
    temp: "27.8°C",
    rainfall: "18%",
  },
  {
    id: "BR-2026-0926-2340",
    status: "Completed",
    time: "23:40 UTC",
    duration: "02m 24s",
    models: 4,
    confidence: 87,
    forecast: "Cloudy",
    temp: "25.9°C",
    rainfall: "31%",
  },
  {
    id: "BR-2026-0926-1820",
    status: "Completed",
    time: "18:20 UTC",
    duration: "02m 09s",
    models: 4,
    confidence: 93,
    forecast: "Clear",
    temp: "29.1°C",
    rainfall: "8%",
  },
  {
    id: "BR-2026-0926-1210",
    status: "Completed",
    time: "12:10 UTC",
    duration: "02m 16s",
    models: 4,
    confidence: 86,
    forecast: "Light Rain",
    temp: "24.7°C",
    rainfall: "64%",
  },
  {
    id: "BR-2026-0926-0545",
    status: "Failed",
    time: "05:45 UTC",
    duration: "00m 42s",
    models: 3,
    confidence: 0,
    forecast: "—",
    temp: "—",
    rainfall: "—",
  },
];

const performanceData = [
  { time: "00:00", duration: 2.2 },
  { time: "04:00", duration: 2.1 },
  { time: "08:00", duration: 2.4 },
  { time: "12:00", duration: 2.2 },
  { time: "16:00", duration: 2.0 },
  { time: "20:00", duration: 2.3 },
  { time: "24:00", duration: 2.1 },
];

const pipelineStages = [
  {
    name: "Data ingestion",
    description: "Weather model data collected",
    time: "38s",
    progress: 100,
    icon: Database,
  },
  {
    name: "Quality validation",
    description: "Input consistency checks",
    time: "21s",
    progress: 100,
    icon: CheckCircle2,
  },
  {
    name: "Adaptive weighting",
    description: "Dynamic model weights calculated",
    time: "27s",
    progress: 100,
    icon: SlidersHorizontal,
  },
  {
    name: "Forecast blending",
    description: "Weighted ensemble generated",
    time: "31s",
    progress: 100,
    icon: Layers3,
  },
  {
    name: "Validation",
    description: "Final forecast quality check",
    time: "21s",
    progress: 100,
    icon: Activity,
  },
];

const modelWeights = [
  {
    name: "ECMWF",
    weight: 34,
    change: 2.4,
  },
  {
    name: "GFS",
    weight: 27,
    change: -1.8,
  },
  {
    name: "ICON",
    weight: 23,
    change: 0.7,
  },
  {
    name: "JMA",
    weight: 16,
    change: -1.3,
  },
];

export default function BlendRunsPage() {
  const [performanceRange, setPerformanceRange] = useState("24 hours");
  const [runs, setRuns] = useState(() =>
    Array.from({ length: 18 }, (_, index) => {
      const run = runHistory[index % runHistory.length];
      const pageSuffix = Math.floor(index / runHistory.length);
      return {
        ...run,
        id: pageSuffix ? `${run.id}-${pageSuffix + 1}` : run.id,
      };
    }),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedRun, setSelectedRun] = useState<(typeof runHistory)[number] | null>(null);
  const [notice, setNotice] = useState("");

  const filteredRuns = useMemo(
    () => runs.filter((run) =>
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "All" || run.status === statusFilter),
    ),
    [runs, searchTerm, statusFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredRuns.length / 6));
  const visibleRuns = filteredRuns.slice(page * 6, page * 6 + 6);

  const handleExport = () => {
    const columns = ["Run ID", "Status", "Time", "Runtime", "Models", "Confidence", "Forecast", "Temperature", "Rainfall"];
    const rows = filteredRuns.map((run) => [run.id, run.status, run.time, run.duration, run.models, run.confidence, run.forecast, run.temp, run.rainfall]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "arsh-blend-runs.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filteredRuns.length} local runs`);
  };

  const handleRunBlend = () => {
    const now = new Date();
    const id = `BR-${now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 12)}`;
    const newRun = {
      id,
      status: "Completed",
      time: `${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`,
      duration: "00m 03s",
      models: 4,
      confidence: 92,
      forecast: "Partly Cloudy",
      temp: "30.6°C",
      rainfall: "14%",
    };
    setRuns((current) => [newRun, ...current]);
    setPage(0);
    setNotice(`Local blend ${id} completed`);
  };

  return (
    <div className="content">
      <div className={styles.page}>
        {/* ==================== PAGE HEADER ==================== */}

        <div className={styles.pageHeader}>
          <div>
            <div className={styles.eyebrow}>
              <GitBranch size={14} />
              FORECAST PIPELINE
            </div>

            <h1>Blend Runs</h1>

            <p>
              Monitor ensemble forecast generation, blending performance and
              pipeline execution history.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRunBlend}
            >
              <Play size={16} />
              Run Blend
            </button>
          </div>
        </div>

        {/* ==================== SUMMARY CARDS ==================== */}

        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span>Runs Today</span>

              <div className={`${styles.iconBox} ${styles.blue}`}>
                <GitBranch size={18} />
              </div>
            </div>

            <div className={styles.summaryValue}>18</div>

            <div className={styles.summaryBottom}>
              <span className={styles.positive}>
                <ArrowUp size={13} />
                12.5%
              </span>

              <span>vs yesterday</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span>Success Rate</span>

              <div className={`${styles.iconBox} ${styles.green}`}>
                <CheckCircle2 size={18} />
              </div>
            </div>

            <div className={styles.summaryValue}>96.4%</div>

            <div className={styles.summaryBottom}>
              <span className={styles.positive}>
                <ArrowUp size={13} />
                1.8%
              </span>

              <span>last 24h</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span>Avg. Runtime</span>

              <div className={`${styles.iconBox} ${styles.orange}`}>
                <Timer size={18} />
              </div>
            </div>

            <div className={styles.summaryValue}>2m 14s</div>

            <div className={styles.summaryBottom}>
              <span className={styles.positive}>
                <ArrowDown size={13} />
                8.2%
              </span>

              <span>faster</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}>
              <span>Avg. Confidence</span>

              <div className={`${styles.iconBox} ${styles.purple}`}>
                <Sparkles size={18} />
              </div>
            </div>

            <div className={styles.summaryValue}>89.6%</div>

            <div className={styles.summaryBottom}>
              <span className={styles.positive}>
                <ArrowUp size={13} />
                2.1%
              </span>

              <span>last 24h</span>
            </div>
          </div>
        </section>

        {/* ==================== LATEST BLEND RUN ==================== */}

        <section className={styles.activeRun}>
          <div className={styles.activeHeader}>
            <div>
              <div className={styles.activeTitle}>
                <span className={styles.liveDot}></span>
                Latest Blend Run
              </div>

              <div className={styles.runId}>
                BR-2026-0927-0842
              </div>
            </div>

            <div className={styles.completedBadge}>
              <CheckCircle2 size={14} />
              Completed
            </div>
          </div>

          <div className={styles.activeBody}>
            <div className={styles.pipeline}>
              {pipelineStages.map((stage, index) => {
                const Icon = stage.icon;

                return (
                  <div
                    className={styles.pipelineItem}
                    key={stage.name}
                  >
                    <div className={styles.pipelineIcon}>
                      <Icon size={17} />
                    </div>

                    <div className={styles.pipelineInfo}>
                      <div className={styles.pipelineTitle}>
                        <span>{stage.name}</span>
                        <span>{stage.time}</span>
                      </div>

                      <div className={styles.pipelineDescription}>
                        {stage.description}
                      </div>

                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${stage.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {index < pipelineStages.length - 1 && (
                      <div className={styles.pipelineConnector} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.activeStats}>
              <div>
                <span>Runtime</span>
                <strong>02m 18s</strong>
              </div>

              <div>
                <span>Models</span>
                <strong>4 / 4</strong>
              </div>

              <div>
                <span>Confidence</span>
                <strong>91%</strong>
              </div>

              <div>
                <span>Forecast Horizon</span>
                <strong>72h</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== MAIN GRID ==================== */}

        <div className={styles.mainGrid}>
          {/* Runtime Performance */}

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Runtime Performance</h2>

                <p>
                  Blend execution duration over the last 24 hours
                </p>
              </div>

              <button
                type="button"
                className={styles.selectButton}
                onClick={() => setPerformanceRange((current) => current === "24 hours" ? "7 days" : current === "7 days" ? "30 days" : "24 hours")}
              >
                Last {performanceRange}
                <ChevronDown size={15} />
              </button>
            </div>

            <div className={styles.chartArea}>
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={performanceRange === "24 hours" ? performanceData : performanceRange === "7 days" ? [...performanceData.slice(0, 1), ...performanceData.slice(2, 6)] : performanceData.filter((_, index) => index % 2 === 0)}>
                  <defs>
                    <linearGradient
                      id="runtimeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="100%"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    domain={[1.8, 2.6]}
                    tickFormatter={(value) => `${value}m`}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)} min`,
                      "Runtime",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="duration"
                    strokeWidth={2}
                    fill="url(#runtimeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Current Blend */}

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Current Blend</h2>

                <p>Weights used in the latest run</p>
              </div>

              <span className={styles.adaptiveBadge}>
                <Zap size={13} />
                Adaptive
              </span>
            </div>

            <div className={styles.weightsList}>
              {modelWeights.map((model) => (
                <div
                  className={styles.weightItem}
                  key={model.name}
                >
                  <div className={styles.weightHeader}>
                    <span className={styles.modelName}>
                      <span className={styles.modelDot}></span>
                      {model.name}
                    </span>

                    <strong>{model.weight}%</strong>
                  </div>

                  <div className={styles.weightTrack}>
                    <div
                      className={styles.weightFill}
                      style={{
                        width: `${model.weight * 2.94}%`,
                      }}
                    />
                  </div>

                  <div className={styles.weightChange}>
                    {model.change > 0 ? (
                      <span className={styles.positive}>
                        <ArrowUp size={12} />
                        {model.change}%
                      </span>
                    ) : (
                      <span className={styles.negative}>
                        <ArrowDown size={12} />
                        {Math.abs(model.change)}%
                      </span>
                    )}

                    <span>vs previous run</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.blendFooter}>
              <span>Weight adaptation window</span>
              <strong>7 days</strong>
            </div>
          </section>
        </div>

        {/* ==================== RUN HISTORY ==================== */}

        <section className={styles.historyPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Run History</h2>

              <p>Recent ensemble forecast executions</p>
            </div>

            <div className={styles.historyActions}>
              <div className={styles.searchInput}>
                <Search size={15} />

                <input
                  type="text"
                  placeholder="Search run ID..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <button
                type="button"
                className={styles.filterButton}
                onClick={() => setFilterOpen((open) => !open)}
              >
                <Filter size={15} />
                Filter
              </button>

              <button
                type="button"
                className={styles.iconOnlyButton}
                aria-label="Refresh run history"
                onClick={() => setNotice("Run history refreshed from local records")}
              >
                <RefreshCw size={15} />
              </button>
            </div>
            {filterOpen && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["All", "Completed", "Failed"].map((status) => (
                  <button
                    type="button"
                    key={status}
                    aria-pressed={statusFilter === status}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(0);
                      setFilterOpen(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Runtime</th>
                  <th>Models</th>
                  <th>Confidence</th>
                  <th>Forecast</th>
                  <th>Temperature</th>
                  <th>Rainfall</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {visibleRuns.map((run) => (
                  <tr key={run.id}>
                    <td>
                      <span className={styles.runIdCell}>
                        {run.id}
                      </span>
                    </td>

                    <td>
                      {run.status === "Completed" ? (
                        <span className={styles.statusCompleted}>
                          <CheckCircle2 size={13} />
                          Completed
                        </span>
                      ) : (
                        <span className={styles.statusFailed}>
                          <XCircle size={13} />
                          Failed
                        </span>
                      )}
                    </td>

                    <td>{run.time}</td>

                    <td>
                      <span className={styles.runtimeCell}>
                        <Clock3 size={13} />
                        {run.duration}
                      </span>
                    </td>

                    <td>
                      <span className={styles.modelsCell}>
                        <Layers3 size={13} />
                        {run.models}
                      </span>
                    </td>

                    <td>
                      {run.confidence > 0 ? (
                        <span className={styles.confidence}>
                          <span
                            className={styles.confidenceBar}
                            style={{
                              width: `${run.confidence}%`,
                            }}
                          />

                          {run.confidence}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>{run.forecast}</td>

                    <td>{run.temp}</td>

                    <td>{run.rainfall}</td>

                    <td>
                      <button
                        type="button"
                        className={styles.rowMenu}
                        aria-label={`Actions for ${run.id}`}
                        onClick={() => setSelectedRun(run)}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableFooter}>
            <span>Showing {filteredRuns.length ? page * 6 + 1 : 0}–{Math.min((page + 1) * 6, filteredRuns.length)} of {filteredRuns.length} runs</span>

            <div className={styles.pagination}>
              <button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                Previous
              </button>

              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  type="button"
                  key={index + 1}
                  className={page === index ? styles.pageNumber : undefined}
                  aria-current={page === index ? "page" : undefined}
                  onClick={() => setPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Next</button>
            </div>
          </div>
          {(notice || selectedRun) && (
            <div className={styles.infoBanner}>
              <div>
                <strong>{selectedRun ? selectedRun.id : notice}</strong>
                {selectedRun && <p>{selectedRun.status} · {selectedRun.forecast} · {selectedRun.temp} · {selectedRun.duration}</p>}
              </div>
              <button type="button" onClick={() => { setSelectedRun(null); setNotice(""); }}>Dismiss</button>
            </div>
          )}
        </section>

        {/* ==================== SYSTEM NOTE ==================== */}

        <div className={styles.infoBanner}>
          <div className={styles.infoIcon}>
            <CloudRain size={17} />
          </div>

          <div>
            <strong>Automatic blending enabled</strong>

            <p>
              Blend runs are automatically triggered when new model data is
              available. Adaptive weights are recalculated before each run.
            </p>
          </div>

          <Link href="/workflow" className={styles.infoBannerLink}>
            View workflow
            <ArrowUp size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}