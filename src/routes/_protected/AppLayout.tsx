import { Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { appStore, clearAuth, toggleTheme } from "@/store/appStore";
import { useEffect } from "react";

const navItems = [
  { to: "/app/users", label: "👥 Users", match: "/app/users" },
  { to: "/app/profile", label: "👤 Profile", match: "/app/profile" },
   { to: "/app/selected people", label: "👤 selected people", match: "/app/selected people" },
  
];

export function AppLayout() {
  const { user, theme } = useStore(appStore, (s) => ({ user: s.user, theme: s.theme }));
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function handleLogout() {
    clearAuth();
    navigate({ to: "/login" });
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
  
      <aside
        style={{
          width: "220px",
          background: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1rem",
          gap: "0.25rem",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "1.5rem", padding: "0 0.5rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9" }}>🧑‍💼 UserMgr</div>
          <div style={{ fontSize: "0.72rem", color: "var(--sidebar-text)", marginTop: "0.2rem" }}>TanStack Dashboard</div>
        </div>

        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.match);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "white" : "var(--sidebar-text)",
                background: isActive ? "var(--sidebar-active)" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

    
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{ justifyContent: "center", marginBottom: "0.5rem", color: "var(--sidebar-text)", borderColor: "#334155" }}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

  
        {user && (
          <div style={{ padding: "0.75rem", background: "#ffffff10", borderRadius: "8px", marginBottom: "0.5rem" }}>
            <img
              src={user.image}
              alt={user.firstName}
              style={{ width: "32px", height: "32px", borderRadius: "50%", marginBottom: "0.4rem" }}
            />
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--sidebar-text)" }}>{user.email}</div>
          </div>
        )}

        <button onClick={handleLogout} className="btn btn-danger" style={{ justifyContent: "center" }}>
          🚪 Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
