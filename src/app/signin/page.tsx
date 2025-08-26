"use client";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [setup, setSetup] = useState<{
    hasDatabase: boolean;
    hasUsers: boolean;
    allowInline?: boolean;
    nodeEnv?: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@goldbod.local");
  const [adminPassword, setAdminPassword] = useState("password");

  useEffect(() => {
    fetch("/api/setup/status")
      .then(async (r) => setSetup(await r.json()))
      .catch(() => setSetup({ hasDatabase: false, hasUsers: false }));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const res = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: "", email, password }).toString(),
      redirect: "follow",
    });
    if (!res.ok) setError("Invalid credentials");
    else window.location.href = "/";
  }

  return (
    <div className="card">
      <h1>Sign in</h1>
      {setup && setup.hasDatabase && !setup.hasUsers && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #f5d97b",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <strong>No users found.</strong> Create the first admin user by
          running the seed script.
          <br />
          <span>In PowerShell:</span>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            $env:ADMIN_EMAIL=&quot;admin@example.com&quot;;
            $env:ADMIN_PASSWORD=&quot;YourPass123!&quot;; npm run db:seed
          </pre>
          {setup.allowInline && (
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div className="row">
                <div className="col">
                  <label>Admin Email</label>
                  <input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    type="email"
                  />
                </div>
                <div className="col">
                  <label>Password</label>
                  <input
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    type="password"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  disabled={creating}
                  onClick={async () => {
                    try {
                      setCreating(true);
                      const res = await fetch(
                        "/api/setup/create-first-admin",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: adminEmail,
                            password: adminPassword,
                            role: "ADMIN",
                          }),
                        }
                      );
                      if (!res.ok)
                        throw new Error((await res.json())?.error || "Failed");
                      alert("Admin created. You can sign in now.");
                      const r = await fetch("/api/setup/status");
                      setSetup(await r.json());
                    } catch (e: any) {
                      alert(e.message);
                    } finally {
                      setCreating(false);
                    }
                  }}
                >
                  Create first admin
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch("/api/setup/status");
                    setSetup(await r.json());
                  }}
                >
                  Refresh
                </button>
              </div>
              <small>
                Inline creation is enabled because ALLOW_INLINE_ADMIN_CREATE=true.
              </small>
            </div>
          )}
        </div>
      )}
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <div>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button type="submit">Sign in</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}
