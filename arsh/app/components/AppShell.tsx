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
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  User,
  Workflow,
} from "lucide-react";

import { demoHealth } from "@/lib/demo-data";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Forecasts", href: "/forecasts", icon: CloudSun },
  { name: "Model Comparison", href: "/models", icon: BarChart3 },
  { name: "Adaptive Weights", href: "/weights", icon: SlidersHorizontal },
  { name: "Skill Metrics", href: "/skill", icon: Activity },
  { name: "Blend Runs", href: "/blend-runs", icon: GitBranch },
  { name: "Extreme Weather", href: "/extreme-weather", icon: CloudLightning },
  { name: "Workflow", href: "/workflow", icon: Workflow },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [health, setHealth] = useState<typeof demoHealth>(demoHealth);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [utcTime, setUtcTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", {
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

  const refreshHealth = () => {
    setHealth({ ...demoHealth, timestamp: new Date().toISOString() });
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;

      if (isMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.querySelector<HTMLInputElement>(".search-box input");
        input?.focus();
      }

      if (event.key === "Escape") {
        setSearchTerm("");
      }

      if (event.key === "Enter" && searchTerm.trim()) {
        const matches = navigation.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
        );

        if (matches[0]) {
          router.push(matches[0].href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, searchTerm]);

  const statusText = useMemo(() => {
    if (health?.healthy === false || health?.status === "Unavailable") {
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
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="brand">
          <div className="brand-name">ARSH</div>
          <div className="brand-subtitle">Weather Intelligence Platform</div>
        </div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? "active" : ""}`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-label">SYSTEM STATUS</div>
          <div className="sidebar-status">
            <span
              className={`status-dot ${
                health?.healthy === false || health?.status === "Unavailable" ? "red" : "green"
              }`}
            />
            <span>
              {health?.healthy === false || health?.status === "Unavailable"
                ? "Local data unavailable"
                : "Local Demo Ready"}
            </span>
          </div>

          <Link
            href="/settings"
            className={`nav-item small ${isActive("/settings") ? "active" : ""}`}
          >
            <Settings size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>

            <div className="search-box">
              <Search size={17} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Search forecasts, models, runs..."
                aria-label="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchTerm.trim()) {
                    const matches = navigation.filter((item) =>
                      item.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
                    );

                    if (matches[0]) {
                      router.push(matches[0].href);
                    }
                  }

                  if (event.key === "Escape") {
                    setSearchTerm("");
                  }
                }}
              />
              <button
                type="button"
                className="search-clear"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                style={{ display: searchTerm ? "inline-flex" : "none" }}
              >
                ×
              </button>
              <span className="search-shortcut">⌘ K</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-operational">
              <span
                className={`status-dot ${
                  health?.healthy === false || health?.status === "Unavailable" ? "red" : "green"
                }`}
              />
              <span>{statusText}</span>
            </div>

            <div className="utc">UTC {utcTime}</div>

            <button
              type="button"
              className="icon-button"
              aria-label="Refresh local data status"
              onClick={refreshHealth}
            >
              <RefreshCw size={18} />
            </button>

            <div className="notifications-wrap">
              <button
                type="button"
                className="icon-button"
                aria-label="Notifications"
                onClick={() => setNotificationsOpen((value) => !value)}
              >
                <Bell size={18} />
              </button>

              {notificationsOpen && (
                <div className="floating-panel notifications-panel">
                  <strong>Notifications</strong>
                  <p>No new notifications</p>
                </div>
              )}
            </div>

            <div className="avatar-wrap">
              <button
                type="button"
                className="avatar-button"
                aria-label="Account menu"
                onClick={() => setAvatarOpen((value) => !value)}
              >
                <span className="avatar">AP</span>
              </button>

              {avatarOpen && (
                <div className="floating-panel account-panel">
                  <div className="menu-row">
                    <User size={14} />
                    <span>Profile</span>
                  </div>
                  <Link href="/settings" className="menu-row" onClick={() => setAvatarOpen(false)}>
                    <Settings size={14} />
                    <span>Settings</span>
                  </Link>
                  <div className="menu-row danger">
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
