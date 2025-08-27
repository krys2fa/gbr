"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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

  const [csrfToken, setCsrfToken] = useState<string | undefined>();
  useEffect(() => {
    fetch("/api/auth/csrf")
      .then(async (r) => setCsrfToken((await r.json())?.csrfToken))
      .catch(() => setCsrfToken(undefined));
  }, []);

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ display: "grid", justifyItems: "center", gap: 16 }}>
        <Image
          src="/goldbod-logo.webp"
          alt="GoldBod"
          width={300}
          height={96}
          priority
          style={{
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(15,23,42,.12)",
            backgroundColor: "black",
          }}
        />
        <div className="card sheen-card" style={{ width: "min(92vw, 440px)" }}>
          <h1 style={{ marginTop: 0, textAlign: "center" }}>Sign in</h1>
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
                            throw new Error(
                              (await res.json())?.error || "Failed"
                            );
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
                    Inline creation is enabled because
                    ALLOW_INLINE_ADMIN_CREATE=true.
                  </small>
                </div>
              )}
            </div>
          )}
          <form
            method="POST"
            action="/api/auth/callback/credentials"
            style={{ display: "grid", gap: 12 }}
            onSubmit={() => {
              // optimistic toast for better UX; dashboard will also show a welcome toast
              notify.info("Signing in…");
            }}
          >
            <input type="hidden" name="csrfToken" value={csrfToken || ""} />
            <input type="hidden" name="callbackUrl" value="/dashboard" />
            <div>
              <label>Email</label>
              <div className="field outlined">
                <span className="icon">
                  <Mail size={16} />
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  name="email"
                  required
                  placeholder="admin@goldbod.local"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label>Password</label>
              <div className="field outlined">
                <span className="icon">
                  <Lock size={16} />
                </span>
                <input
                  key={showPw ? "pw-text" : "pw-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <span className="rightAction">
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((v) => !v)}
                    title={showPw ? "Hide" : "Show"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </div>
              <div className="help">
                Use at least 8 characters, including a number or symbol.
              </div>
            </div>
            <Button type="submit" variant="primary">
              Sign in
            </Button>
            <div
              aria-live="polite"
              style={{ position: "absolute", left: -9999 }}
            >
              {error ? "" : ""}
            </div>
            {error && <p style={{ color: "crimson" }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
