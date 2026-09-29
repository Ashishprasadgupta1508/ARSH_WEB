"use client";

import { useMemo, useState } from "react";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Eye,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ThermometerSun,
  Wind,
} from "lucide-react";

import styles from "./extreme-weather.module.css";

const activeAlertsSeed = [
  {
    title: "Heavy Rainfall",
    region: "Northeast India",
    area: "Assam • Meghalaya • Arunachal Pradesh",
    severity: "Severe",
    probability: "86%",
    valid: "27 Sep, 12:00 – 28 Sep, 12:00 UTC",
    description:
      "Forecast indicates sustained heavy precipitation with localized intense rainfall during the next 24 hours.",
    icon: CloudRain,
    className: "severe",
  },
  {
    title: "Heat Stress",
    region: "Central India",
    area: "Madhya Pradesh • Vidarbha",
    severity: "Moderate",
    probability: "74%",
    valid: "27 Sep, 12:00 – 28 Sep, 18:00 UTC",
    description:
      "Elevated temperatures are expected across the selected region with limited overnight cooling.",
    icon: ThermometerSun,
    className: "moderate",
  },
  {
    title: "High Wind",
    region: "West Coast",
    area: "Konkan • Goa • Coastal Karnataka",
    severity: "Moderate",
    probability: "68%",
    valid: "27 Sep, 18:00 – 28 Sep, 12:00 UTC",
    description:
      "Strong surface winds are expected along exposed coastal locations.",
    icon: Wind,
    className: "moderate",
  },
];

const recentEventsSeed = [
  {
    type: "Heavy Rainfall",
    region: "Northeast",
    severity: "Severe",
    detected: "27 Sep, 08:42 UTC",
    duration: "6h 18m",
    status: "Active",
  },
  {
    type: "Heat Stress",
    region: "Central India",
    severity: "Moderate",
    detected: "27 Sep, 06:15 UTC",
    duration: "8h 42m",
    status: "Active",
  },
  {
    type: "High Wind",
    region: "West Coast",
    severity: "Moderate",
    detected: "27 Sep, 04:30 UTC",
    duration: "5h 10m",
    status: "Active",
  },
  {
    type: "Extreme Rainfall",
    region: "East India",
    severity: "Severe",
    detected: "26 Sep, 22:10 UTC",
    duration: "4h 36m",
    status: "Resolved",
  },
  {
    type: "High Temperature",
    region: "North India",
    severity: "Low",
    detected: "26 Sep, 18:45 UTC",
    duration: "3h 24m",
    status: "Resolved",
  },
  {
    type: "Strong Wind",
    region: "South India",
    severity: "Low",
    detected: "26 Sep, 15:20 UTC",
    duration: "2h 48m",
    status: "Resolved",
  },
];

const riskDistributionSeed = [
  {
    label: "Severe",
    value: 2,
    percent: "22%",
    className: "severe",
  },
  {
    label: "Moderate",
    value: 5,
    percent: "56%",
    className: "moderate",
  },
  {
    label: "Low",
    value: 2,
    percent: "22%",
    className: "low",
  },
];

const regionsSeed = [
  {
    name: "Northeast India",
    risk: "High",
    score: 82,
    events: 4,
  },
  {
    name: "Central India",
    risk: "Moderate",
    score: 67,
    events: 3,
  },
  {
    name: "West Coast",
    risk: "Moderate",
    score: 59,
    events: 2,
  },
  {
    name: "North India",
    risk: "Low",
    score: 34,
    events: 1,
  },
];

export default function ExtremeWeatherPage() {
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [timeWindow, setTimeWindow] = useState("Next 24 Hours");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState("just now");
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [eventStatusFilter, setEventStatusFilter] = useState("All");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [menu, setMenu] = useState<
    "region" | "event" | "severity" | "time" | null
  >(null);

  const regionOptions = ["All Regions", "Northeast India", "Central India", "West Coast", "North India"];
  const eventOptions = ["All Events", "Heavy Rainfall", "Heat Stress", "High Wind"];
  const severityOptions = ["All Severity", "Severe", "Moderate", "Low"];
  const timeOptions = ["Next 24 Hours", "Next 48 Hours", "Next 72 Hours", "7 Days"];

  const activeAlerts = useMemo(() => {
    const alerts = activeAlertsSeed.filter((alert) => {
      const matchesRegion =
        regionFilter === "All Regions" || alert.region === regionFilter;
      const matchesEvent =
        eventFilter === "All Events" || alert.title === eventFilter;
      const matchesSeverity =
        severityFilter === "All Severity" || alert.severity === severityFilter;

      return matchesRegion && matchesEvent && matchesSeverity;
    });

    return alerts.filter((alert) =>
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.region.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [regionFilter, eventFilter, severityFilter, searchTerm]);

  const recentEvents = useMemo(() =>
    recentEventsSeed.filter((event) => {
      const term = searchTerm.toLowerCase();
      return (
        event.type.toLowerCase().includes(term) ||
        event.region.toLowerCase().includes(term) ||
        (!term && true)
      ) && (eventStatusFilter === "All" || event.status === eventStatusFilter);
    }),
  [eventStatusFilter, searchTerm]);

  const riskDistribution = useMemo(
    () => riskDistributionSeed,
    [],
  );

  const regions = useMemo(
    () => regionsSeed,
    [],
  );

  const handleSelect = (
    key: "region" | "event" | "severity" | "time",
    option: string,
  ) => {
    if (key === "region") setRegionFilter(option);
    if (key === "event") setEventFilter(option);
    if (key === "severity") setSeverityFilter(option);
    if (key === "time") setTimeWindow(option);
    setMenu(null);
  };

  const renderFilterButton = (
    label: string,
    value: string,
    keyName: "region" | "event" | "severity" | "time",
    options: string[],
  ) => (
    <div className={styles.filterField}>
      <label>{label}</label>

      <button type="button" onClick={() => setMenu(menu === keyName ? null : keyName)}>
        {value}
        <ChevronDown size={14} />
      </button>

      {menu === keyName && (
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
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className={styles.pageHeader}>
          <div>
            <div className={styles.breadcrumb}>
              ARSH <span>/</span> Extreme Weather
            </div>

            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <ShieldAlert size={19} />
              </div>

              <div>
                <h1>Extreme Weather</h1>

                <p>
                  Monitor severe weather conditions and forecast-based
                  risk indicators across monitored regions.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setLastRefreshed(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}>
              <RefreshCw size={14} />
              Refresh
            </button>

            <button type="button" className={styles.primaryButton} onClick={() => setAlertSettingsOpen((open) => !open)}>
              <Bell size={14} />
              Alert Settings
            </button>
          </div>
        </div>
        <div style={{ margin: "-12px 0 16px", color: "#687587", fontSize: 12 }}>Last refreshed {lastRefreshed} UTC</div>
        {alertSettingsOpen && (
          <section className={styles.panel} style={{ marginBottom: 16 }}>
            <strong>Alert notifications</strong>
            <p style={{ margin: "6px 0 12px" }}>Manage local severe-weather alert notifications.</p>
            <button type="button" className={styles.secondaryButton} onClick={() => setAlertsEnabled((enabled) => !enabled)}>
              {alertsEnabled ? "Disable alerts" : "Enable alerts"}
            </button>
            <span style={{ marginLeft: 12 }}>{alertsEnabled ? "Enabled" : "Disabled"}</span>
          </section>
        )}

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.red}`}>
              <ShieldAlert size={18} />
            </div>

            <div>
              <span>Active Alerts</span>
              <strong>3</strong>

              <small>
                <i className={styles.redDot} />
                2 severe conditions
              </small>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.orange}`}>
              <AlertTriangle size={18} />
            </div>

            <div>
              <span>Events Today</span>
              <strong>9</strong>

              <small>
                <b>+2</b> vs yesterday
              </small>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.blue}`}>
              <MapPin size={18} />
            </div>

            <div>
              <span>Regions Monitored</span>
              <strong>12</strong>

              <small>India coverage</small>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.green}`}>
              <CheckCircle2 size={18} />
            </div>

            <div>
              <span>Detection Confidence</span>
              <strong>91.4%</strong>

              <small>Latest model run</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className={styles.filterPanel}>
          <div className={styles.filterTitle}>
            <Filter size={15} />

            <div>
              <strong>Event Filters</strong>
              <span>Refine extreme weather monitoring results</span>
            </div>
          </div>

          <div className={styles.filters}>
            {renderFilterButton("Region", regionFilter, "region", regionOptions)}
            {renderFilterButton("Event Type", eventFilter, "event", eventOptions)}
            {renderFilterButton("Severity", severityFilter, "severity", severityOptions)}
            {renderFilterButton("Time Window", timeWindow, "time", timeOptions)}

            <button type="button" className={styles.filterButton} onClick={() => setFiltersApplied(true)}>
              {filtersApplied ? "Filters Applied" : "Apply Filters"}
            </button>
          </div>
        </section>

        {/* =====================================================
            ACTIVE ALERTS
        ===================================================== */}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                Active Weather Alerts
                <span className={styles.countBadge}>3</span>
              </h2>

              <p>
                Forecast-derived extreme weather conditions requiring
                attention.
              </p>
            </div>

            <span className={styles.updated}>
              Updated 12 minutes ago
            </span>
          </div>

          <div className={styles.alertGrid}>
            {activeAlerts.map((alert) => {
              const Icon = alert.icon;

              return (
                <article
                  className={`${styles.alertCard} ${
                    styles[alert.className]
                  }`}
                  key={alert.title}
                >
                  <div className={styles.alertTop}>
                    <div
                      className={`${styles.alertIcon} ${
                        styles[alert.className]
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <span
                      className={`${styles.severityBadge} ${
                        styles[alert.className]
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <h3>{alert.title}</h3>

                  <div className={styles.alertRegion}>
                    <MapPin size={12} />
                    {alert.region}
                  </div>

                  <div className={styles.alertArea}>
                    {alert.area}
                  </div>

                  <p>{alert.description}</p>

                  <div className={styles.alertMeta}>
                    <div>
                      <span>Probability</span>
                      <strong>{alert.probability}</strong>
                    </div>

                    <div>
                      <span>Valid Period</span>
                      <strong>{alert.valid}</strong>
                    </div>
                  </div>

                  <div className={styles.alertFooter}>
                    <button type="button" onClick={() => setSelectedAlert(selectedAlert === alert.title ? "" : alert.title)}>
                      <Eye size={13} />
                      {selectedAlert === alert.title ? "Hide Details" : "View Details"}
                    </button>

                    <span>
                      <span className={styles.liveDot} />
                      Live
                    </span>
                  </div>
                  {selectedAlert === alert.title && <p style={{ marginTop: 10 }}>{alert.description}</p>}
                </article>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            LOWER GRID
        ===================================================== */}

        <section className={styles.lowerGrid}>
          {/* ===================================================
              RISK DISTRIBUTION
          =================================================== */}

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Risk Distribution</h2>
                <p>Current detected event severity</p>
              </div>

              <span className={styles.panelTag}>
                9 Events
              </span>
            </div>

            <div className={styles.riskContent}>
              <div className={styles.riskVisual}>
                <div
                  className={`${styles.riskRing} ${styles.riskRingSevere}`}
                >
                  <div>
                    <strong>9</strong>
                    <span>Events</span>
                  </div>
                </div>
              </div>

              <div className={styles.riskList}>
                {riskDistribution.map((risk) => (
                  <div className={styles.riskItem} key={risk.label}>
                    <div>
                      <span
                        className={`${styles.riskDot} ${
                          styles[risk.className]
                        }`}
                      />

                      <span>{risk.label}</span>
                    </div>

                    <strong>
                      {risk.value}
                      <small>{risk.percent}</small>
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===================================================
              REGION RISK
          =================================================== */}

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Regional Risk</h2>
                <p>Forecast-based risk score</p>
              </div>

              <button className={styles.viewButton} onClick={() => setMapOpen((open) => !open)}>
                {mapOpen ? "Hide Map" : "View Map"} →
              </button>
            </div>
            {mapOpen && <p style={{ padding: "0 18px", color: "#687587" }}>Regional risk overview: {regions.map((region) => `${region.name} ${region.score}`).join(" · ")}</p>}

            <div className={styles.regionList}>
              {regions.map((region) => (
                <div className={styles.regionRow} key={region.name}>
                  <div className={styles.regionInfo}>
                    <strong>{region.name}</strong>

                    <span>
                      {region.events} active event
                      {region.events !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className={styles.regionScore}>
                    <div className={styles.scoreBar}>
                      <span
                        style={{
                          width: `${region.score}%`,
                        }}
                      />
                    </div>

                    <strong>{region.score}</strong>
                  </div>

                  <span
                    className={`${styles.regionRisk} ${
                      region.risk === "High"
                        ? styles.high
                        : region.risk === "Moderate"
                          ? styles.medium
                          : styles.low
                    }`}
                  >
                    {region.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            RECENT EVENTS
        ===================================================== */}

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent Extreme Weather Events</h2>

              <p>
                Historical events detected by the ARSH forecasting
                pipeline.
              </p>
            </div>

            <div className={styles.tableActions}>
              <div className={styles.search}>
                <Search size={13} />

                <input
                  placeholder="Search events..."
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <button className={styles.tableFilter} onClick={() => setEventStatusFilter((current) => current === "All" ? "Active" : current === "Active" ? "Resolved" : "All")}>
                <Filter size={13} />
                {eventStatusFilter === "All" ? "Filter" : eventStatusFilter}
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Region</th>
                  <th>Severity</th>
                  <th>Detected</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {recentEvents.map((event) => (
                  <tr key={`${event.type}-${event.region}`}>
                    <td>
                      <div className={styles.eventType}>
                        <span className={styles.eventTypeIcon}>
                          {event.type.includes("Rain") ? (
                            <CloudRain size={14} />
                          ) : event.type.includes("Wind") ? (
                            <Wind size={14} />
                          ) : (
                            <ThermometerSun size={14} />
                          )}
                        </span>

                        <strong>{event.type}</strong>
                      </div>
                    </td>

                    <td>{event.region}</td>

                    <td>
                      <span
                        className={`${styles.tableSeverity} ${
                          styles[
                            event.severity.toLowerCase()
                          ]
                        }`}
                      >
                        {event.severity}
                      </span>
                    </td>

                    <td>{event.detected}</td>

                    <td>{event.duration}</td>

                    <td>
                      <span
                        className={`${styles.status} ${
                          event.status === "Active"
                            ? styles.active
                            : styles.resolved
                        }`}
                      >
                        <i />
                        {event.status}
                      </span>
                    </td>

                    <td>
                      <button className={styles.rowAction} aria-label={`View ${event.type} in ${event.region}`} aria-pressed={selectedAlert === `${event.type}-${event.region}`} onClick={() => setSelectedAlert(selectedAlert === `${event.type}-${event.region}` ? "" : `${event.type}-${event.region}`)}>
                        {selectedAlert === `${event.type}-${event.region}` ? <CheckCircle2 size={14} /> : <Eye size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            DECISION SUPPORT NOTICE
        ===================================================== */}

        <div className={styles.notice}>
          <div className={styles.noticeIcon}>
            <AlertTriangle size={15} />
          </div>

          <div>
            <strong>
              COMPUTED GUIDANCE / DECISION SUPPORT
            </strong>

            <p>
              Extreme weather indicators are generated from forecast
              model outputs and validation metrics. They are intended
              for decision support and are not official weather
              warnings or advisories.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}