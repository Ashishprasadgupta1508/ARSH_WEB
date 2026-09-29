"use client";

import { useState } from "react";

import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  Layers3,
  Play,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Square,
  Target,
  Workflow as WorkflowIcon,
  Zap,
} from "lucide-react";

import styles from "./workflow.module.css";

const stages = [
  {
    number: "01",
    title: "Data Ingestion",
    description: "Collect and normalize weather model inputs.",
    detail: "Weather model data collected",
    runtime: "38s",
    status: "Completed",
    icon: Database,
    tone: "blue",
  },
  {
    number: "02",
    title: "Quality Validation",
    description: "Check input completeness and consistency.",
    detail: "Input consistency checks",
    runtime: "21s",
    status: "Completed",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    number: "03",
    title: "Adaptive Weighting",
    description: "Calculate model contributions from recent skill.",
    detail: "Dynamic model weights calculated",
    runtime: "27s",
    status: "Completed",
    icon: SlidersHorizontal,
    tone: "purple",
  },
  {
    number: "04",
    title: "Forecast Blending",
    description: "Generate the weighted ensemble forecast.",
    detail: "Weighted ensemble generated",
    runtime: "31s",
    status: "Completed",
    icon: Layers3,
    tone: "orange",
  },
  {
    number: "05",
    title: "Validation",
    description: "Evaluate the final blended forecast.",
    detail: "Final forecast quality check",
    runtime: "21s",
    status: "Completed",
    icon: Target,
    tone: "green",
  },
];

const executionHistory = [
  {
    id: "BR-2026-0927-0842",
    started: "27 Sep, 08:42 UTC",
    duration: "02m 18s",
    models: "4 / 4",
    confidence: "91%",
    status: "Completed",
  },
  {
    id: "BR-2026-0927-0615",
    started: "27 Sep, 06:15 UTC",
    duration: "02m 21s",
    models: "4 / 4",
    confidence: "89%",
    status: "Completed",
  },
  {
    id: "BR-2026-0927-0310",
    started: "27 Sep, 03:10 UTC",
    duration: "02m 16s",
    models: "4 / 4",
    confidence: "92%",
    status: "Completed",
  },
  {
    id: "BR-2026-0926-2210",
    started: "26 Sep, 22:10 UTC",
    duration: "02m 28s",
    models: "4 / 4",
    confidence: "88%",
    status: "Completed",
  },
  {
    id: "BR-2026-0926-1845",
    started: "26 Sep, 18:45 UTC",
    duration: "02m 34s",
    models: "3 / 4",
    confidence: "84%",
    status: "Partial",
  },
];

export default function WorkflowPage() {
  const [running, setRunning] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState("just now");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [showAllExecutions, setShowAllExecutions] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [workflowNotice, setWorkflowNotice] = useState("");

  const handleRunWorkflow = () => {
    setRunning(true);
    setWorkflowNotice("Local workflow run started");
    window.setTimeout(() => {
      setRunning(false);
      setWorkflowNotice("Local workflow run completed successfully");
    }, 1200);
  };

  return (
    <main className="content">
      <div className={styles.page}>
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className={styles.pageHeader}>
          <div>
            <div className={styles.breadcrumb}>
              ARSH <span>/</span> Workflow
            </div>

            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <WorkflowIcon size={19} />
              </div>

              <div>
                <h1>Forecast Workflow</h1>

                <p>
                  Configure, monitor and execute the ARSH weather
                  forecasting and blending pipeline.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setLastRefreshed(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}>
              <RefreshCw size={14} />
              Refresh
            </button>

            <button type="button" className={styles.primaryButton} onClick={handleRunWorkflow} disabled={running}>
              <Play size={14} />
              {running ? "Running..." : "Run Workflow"}
            </button>
          </div>
        </div>
        <div style={{ margin: "-12px 0 16px", color: "#687587", fontSize: 12 }}>Local workflow state refreshed {lastRefreshed} UTC</div>
        {workflowNotice && <p role="status" style={{ color: "#2474d2" }}>{workflowNotice}</p>}

        {/* =====================================================
            WORKFLOW STATUS
        ===================================================== */}

        <section className={styles.statusBanner}>
          <div className={styles.statusLeft}>
            <div className={styles.statusIcon}>
              <Activity size={19} />
            </div>

            <div>
              <span>WORKFLOW STATUS</span>
              <strong>Operational</strong>
              <p>
                Automatic forecast blending is enabled and all
                configured pipeline stages are available.
              </p>
            </div>
          </div>

          <div className={styles.statusMetrics}>
            <div>
              <span>Last Run</span>
              <strong>08:42 UTC</strong>
            </div>

            <div>
              <span>Runtime</span>
              <strong>02m 18s</strong>
            </div>

            <div>
              <span>Success Rate</span>
              <strong>96.4%</strong>
            </div>

            <div>
              <span>Schedule</span>
              <strong>Every 3 Hours</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            PIPELINE
        ===================================================== */}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Forecast Pipeline</h2>
              <p>
                Ordered execution flow used to generate the blended
                forecast.
              </p>
            </div>

            <div className={styles.pipelineActions}>
              <span className={styles.enabledBadge}>
                <i />
                Automatic
              </span>

              <button type="button" className={styles.settingsButton} onClick={() => setScheduleEnabled((value) => !value)}>
                <Settings2 size={13} />
                {scheduleEnabled ? "Configure" : "Configured"}
              </button>
            </div>
          </div>

          <div className={styles.pipeline}>
            {stages.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <div className={styles.stageWrapper} key={stage.number}>
                  <article className={styles.stage}>
                    <div
                      className={`${styles.stageNumber} ${
                        styles[stage.tone]
                      }`}
                    >
                      {stage.number}
                    </div>

                    <div
                      className={`${styles.stageIcon} ${
                        styles[stage.tone]
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className={styles.stageMain}>
                      <div className={styles.stageHeading}>
                        <div>
                          <h3>{stage.title}</h3>
                          <p>{stage.description}</p>
                        </div>

                        <span className={styles.completedBadge}>
                          <Check size={11} />
                          {stage.status}
                        </span>
                      </div>

                      <div className={styles.stageBottom}>
                        <span>{stage.detail}</span>

                        <div>
                          <Clock3 size={12} />
                          {stage.runtime}
                        </div>
                      </div>

                      <div className={styles.progressTrack}>
                        <span />
                      </div>
                    </div>

                    <button type="button" className={styles.stageMenu} aria-expanded={expandedStage === stage.number} title={stage.detail} onClick={() => setExpandedStage((current) => current === stage.number ? null : stage.number)}>
                      <ChevronDown size={15} />
                    </button>
                  </article>

                  {index < stages.length - 1 && (
                    <div className={styles.connector}>
                      <span />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            CONFIGURATION GRID
        ===================================================== */}

        <section className={styles.configGrid}>
          {/* MODEL INPUT */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Model Inputs</h2>
                <p>Models participating in the blend.</p>
              </div>

              <span className={styles.smallTag}>4 Models</span>
            </div>

            <div className={styles.modelList}>
              <div className={styles.modelRow}>
                <span className={`${styles.modelDot} ${styles.ecmwf}`} />
                <div>
                  <strong>ECMWF</strong>
                  <small>ECMWF IFS</small>
                </div>

                <span className={styles.modelStatus}>
                  Available
                </span>
              </div>

              <div className={styles.modelRow}>
                <span className={`${styles.modelDot} ${styles.gfs}`} />
                <div>
                  <strong>GFS</strong>
                  <small>NOAA GFS</small>
                </div>

                <span className={styles.modelStatus}>
                  Available
                </span>
              </div>

              <div className={styles.modelRow}>
                <span className={`${styles.modelDot} ${styles.icon}`} />
                <div>
                  <strong>ICON</strong>
                  <small>DWD ICON</small>
                </div>

                <span className={styles.modelStatus}>
                  Available
                </span>
              </div>

              <div className={styles.modelRow}>
                <span className={`${styles.modelDot} ${styles.jma}`} />
                <div>
                  <strong>JMA</strong>
                  <small>JMA GSM</small>
                </div>

                <span className={styles.modelStatus}>
                  Available
                </span>
              </div>
            </div>
          </div>

          {/* BLENDING CONFIG */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Blending Configuration</h2>
                <p>Current ensemble generation settings.</p>
              </div>

              <span className={styles.activeTag}>Active</span>
            </div>

            <div className={styles.configList}>
              <div className={styles.configRow}>
                <span>Weighting Strategy</span>
                <strong>Inverse Error</strong>
              </div>

              <div className={styles.configRow}>
                <span>Adaptation Window</span>
                <strong>7 Days</strong>
              </div>

              <div className={styles.configRow}>
                <span>Forecast Horizon</span>
                <strong>72 Hours</strong>
              </div>

              <div className={styles.configRow}>
                <span>Update Frequency</span>
                <strong>3 Hours</strong>
              </div>

              <div className={styles.configRow}>
                <span>Primary Variable</span>
                <strong>Temperature</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PIPELINE HEALTH
        ===================================================== */}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Pipeline Health</h2>
              <p>Current availability of workflow services.</p>
            </div>

            <span className={styles.healthBadge}>
              <i />
              All Systems Operational
            </span>
          </div>

          <div className={styles.healthGrid}>
            <div className={styles.healthCard}>
              <div className={styles.healthIcon}>
                <Database size={16} />
              </div>

              <div>
                <strong>Data Ingestion</strong>
                <span>Operational</span>
              </div>

              <b>99.9%</b>
            </div>

            <div className={styles.healthCard}>
              <div className={styles.healthIcon}>
                <GitBranch size={16} />
              </div>

              <div>
                <strong>Model Gateway</strong>
                <span>Operational</span>
              </div>

              <b>99.8%</b>
            </div>

            <div className={styles.healthCard}>
              <div className={styles.healthIcon}>
                <Sparkles size={16} />
              </div>

              <div>
                <strong>Blend Engine</strong>
                <span>Operational</span>
              </div>

              <b>99.7%</b>
            </div>

            <div className={styles.healthCard}>
              <div className={styles.healthIcon}>
                <Target size={16} />
              </div>

              <div>
                <strong>Validation Engine</strong>
                <span>Operational</span>
              </div>

              <b>99.9%</b>
            </div>
          </div>
        </section>

        {/* =====================================================
            EXECUTION HISTORY
        ===================================================== */}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Execution History</h2>
              <p>
                Recent workflow executions and their final results.
              </p>
            </div>

            <button type="button" className={styles.settingsButton} onClick={() => setShowAllExecutions((show) => !show)}>
              {showAllExecutions ? "Show Recent" : "View All"}
              <span>→</span>
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Models</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {executionHistory.slice(0, showAllExecutions ? executionHistory.length : 3).map((run) => (
                  <tr key={run.id}>
                    <td>
                      <strong className={styles.runId}>
                        {run.id}
                      </strong>
                    </td>

                    <td>{run.started}</td>
                    <td>{run.duration}</td>
                    <td>{run.models}</td>

                    <td>
                      <strong className={styles.confidence}>
                        {run.confidence}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`${styles.runStatus} ${
                          run.status === "Partial"
                            ? styles.partial
                            : styles.completed
                        }`}
                      >
                        <i />
                        {run.status}
                      </span>
                    </td>

                    <td>
                      <button type="button" className={styles.moreButton} aria-pressed={selectedExecution === run.id} onClick={() => setSelectedExecution(selectedExecution === run.id ? null : run.id)}>
                        {selectedExecution === run.id ? "Selected" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            CONTROL BAR
        ===================================================== */}

        <section className={styles.controlBar}>
          <div className={styles.controlInfo}>
            <div className={styles.controlIcon}>
              <Zap size={16} />
            </div>

            <div>
              <strong>Automatic Workflow Execution</strong>

              <p>
                ARSH automatically executes the forecasting pipeline
                every 3 hours when new model data is available.
              </p>
            </div>
          </div>

          <div className={styles.controlActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setScheduleEnabled((value) => !value)}>
              <Square size={12} />
              {scheduleEnabled ? "Disable Schedule" : "Enable Schedule"}
            </button>

            <button type="button" className={styles.primaryButton} onClick={handleRunWorkflow} disabled={running}>
              <Play size={13} />
              {running ? "Running..." : "Run Now"}
            </button>
          </div>
        </section>

        {/* =====================================================
            FOOTER NOTE
        ===================================================== */}

        <div className={styles.notice}>
          <AlertCircle size={14} />

          <span>
            Workflow configuration changes affect future forecast
            runs. Existing completed runs remain unchanged.
          </span>
        </div>
      </div>
    </main>
  );
}