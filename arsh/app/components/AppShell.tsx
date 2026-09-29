"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  Bell,
  CloudLightning,
  CloudSun,
  GitBranch,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Settings,
  Workflow,
} from "lucide-react";

import { demoHealth } from "@/lib/demo-data";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Forecasts", href: "/forecasts", icon: CloudSun },
  { name: "Model Comparison", href: "/models", icon: BarChart3 },
  { name: "Adaptive Weights", href: "/weights", icon: Activity },
  { name: "Skill Metrics", href: "/skill", icon: Activity },
  { name: "Blend Runs", href: "/blend-runs", icon: GitBranch },
  { name: "Extreme Weather", href: "/extreme-weather", icon: CloudLightning },
  { name: "Workflow", href: "/workflow", icon: Workflow },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [health, setHealth] = useState<typeof demoHealth>(demoHealth);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [utcTime, setUtcTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

  const refreshHealth = () => {
    setHealth({
      ...demoHealth,
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUtcTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const goToSearchResult = (term: string) => {
    const cleanTerm = term.trim().toLowerCase();

    if (!cleanTerm) {
      return;
    }

    const match = navigation.find((item) =>
      item.name.toLowerCase().includes(cleanTerm),
    );

    if (match) {
      router.push(match.href);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;

      if (isMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();

        const input =
          document.querySelector<HTMLInputElement>(".search-box input");

        input?.focus();
      }

      if (event.key === "Escape") {
        setSearchTerm("");
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const statusText = useMemo(() => {
    if (
      health?.healthy === false ||
      health?.status === "Unavailable"
    ) {
      return "Local data unavailable";
    }

    return health?.status ?? "System Operational";
  }, [health]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="arsh-shell">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`sidebar ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        {/* LOGO */}
        <div className="brand">
          <Link href="/" className="brand-logo-link">
            <img
              src="/arsh-logo.png"
              alt="ARSH - Intelligent Forecast Blending"
              className="brand-logo"
            />
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${
                  isActive(item.href) ? "active" : ""
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">
          <div className="system-label">
            SYSTEM STATUS
          </div>

          <div className="sidebar-status">
            <span
              className={`status-dot ${
                health?.healthy === false ||
                health?.status === "Unavailable"
                  ? "red"
                  : "green"
              }`}
            />

            <span>
              {health?.healthy === false ||
              health?.status === "Unavailable"
                ? "Local data unavailable"
                : "Local Demo Ready"}
            </span>
          </div>

          <Link
            href="/settings"
            className={`nav-item small ${
              isActive("/settings") ? "active" : ""
            }`}
          >
            <Settings size={17} strokeWidth={1.8} />

            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              aria-label="Toggle sidebar"
              onClick={() =>
                setSidebarCollapsed((value) => !value)
              }
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>

            {/* SEARCH */}
            <div className="search-box">
              <Search size={17} strokeWidth={1.8} />

              <input
                type="text"
                placeholder="Search forecasts, models, runs..."
                aria-label="Search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    goToSearchResult(searchTerm);
                  }

                  if (event.key === "Escape") {
                    setSearchTerm("");
                  }
                }}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}

              <span className="search-shortcut">
                ⌘ K
              </span>
            </div>
          </div>

          {/* TOPBAR RIGHT */}
          <div className="topbar-right">
            {/* SYSTEM STATUS */}
            <div className="system-operational">
              <span
                className={`status-dot ${
                  health?.healthy === false ||
                  health?.status === "Unavailable"
                    ? "red"
                    : "green"
                }`}
              />

              <span>{statusText}</span>
            </div>

            {/* UTC */}
            <div className="utc">
              UTC {utcTime}
            </div>

            {/* REFRESH */}
            <button
              type="button"
              className="icon-button"
              aria-label="Refresh local data status"
              onClick={refreshHealth}
            >
              <RefreshCw size={18} />
            </button>

            {/* NOTIFICATIONS */}
            <div className="notifications-wrap">
              <button
                type="button"
                className="icon-button"
                aria-label="Notifications"
                onClick={() =>
                  setNotificationsOpen((value) => !value)
                }
              >
                <Bell size={18} />
              </button>

              {notificationsOpen && (
                <div className="floating-panel notifications-panel">
                  <strong>Notifications</strong>

                  <p>
                    No new notifications
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}