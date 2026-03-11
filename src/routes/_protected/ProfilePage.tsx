import { useStore } from "@tanstack/react-store";
import { appStore } from "@/store/appStore";

export function ProfilePage() {
  const user = useStore(appStore, (s) => s.user);

  if (!user) return null;

  const details = [
    { label: "First Name", value: user.firstName },
    { label: "Last Name", value: user.lastName },
    { label: "Username", value: `@${user.username}` },
    { label: "Email", value: user.email },
    { label: "User ID", value: `#${user.id}` },
  ];

  return (
    <div style={{ maxWidth: "500px" }}>
      <h1 className="page-title" style={{ marginBottom: "1.5rem" }}>My Profile</h1>

      <div className="card" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src={user.image}
          alt={user.firstName}
          style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", marginBottom: "1rem", border: "3px solid var(--accent)" }}
        />
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {user.firstName} {user.lastName}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>@{user.username}</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {details.map((d) => (
            <div
              key={d.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.6rem 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text)" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
        Profile data is stored in TanStack Store and populated on login.
      </p>
    </div>
  );
}
