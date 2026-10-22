import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import brandLogo from "@/assets/logo-vikasita-ml-official.png";
import { createAdminSession, isAdminAuthenticated } from "@/lib/admin-auth";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Admin Login · Vikasita Keralam" },
      {
        name: "description",
        content: "Secure administrator access for Vikasita Keralam operations.",
      },
    ],
  }),
  component: AdminLoginPage,
});

const DEMO_USERNAME = "admin@xyz.com";
const DEMO_PASSWORD = "Admin";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminAuthenticated()) void navigate({ to: "/admin", replace: true });
  }, [navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    window.setTimeout(() => {
      if (username.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD) {
        createAdminSession(DEMO_USERNAME);
        void navigate({ to: "/admin", replace: true });
        return;
      }
      setSubmitting(false);
      setError("The username or password is incorrect.");
    }, 350);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background lg:h-[100dvh] lg:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_88%_80%,hsl(var(--secondary)/0.1),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-secondary" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-5 px-4 py-6 lg:h-full lg:min-h-0 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-[clamp(1.25rem,3vh,2rem)]">
        <section className="hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.11] via-card to-secondary/[0.08] shadow-sm lg:flex lg:h-[min(560px,calc(100dvh-2.5rem))] lg:flex-col lg:p-[clamp(1.5rem,3vh,2rem)]">
          <img
            src={brandLogo}
            alt="Vikasita Keralam"
            className="h-[clamp(3.75rem,7vh,4.5rem)] w-auto object-contain object-left"
          />
          <div className="mt-[clamp(1.75rem,4vh,2.75rem)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure operations workspace
            </div>
            <h1 className="mt-[clamp(1rem,2vh,1.5rem)] max-w-xl font-display text-[clamp(2.4rem,5.5vh,4rem)] font-bold leading-[1.06] text-foreground">
              Every application.
              <br />
              One accountable workflow.
            </h1>
            <p className="mt-[clamp(0.75rem,1.8vh,1.25rem)] max-w-xl text-base leading-7 text-muted-foreground">
              Coordinate scheme verification, application support, helpdesk workloads and citizen
              follow-up across Kerala.
            </p>
          </div>

          <div className="mt-[clamp(1.5rem,3.5vh,2.25rem)] grid gap-2.5 sm:grid-cols-3">
            {["Masked citizen information", "Role-based operations", "Audited document access"].map(
              (item) => (
                <div key={item} className="rounded-2xl border border-border bg-background/75 p-3">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <p className="mt-2 text-xs font-semibold leading-4">{item}</p>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col justify-center rounded-3xl border border-border bg-card p-5 shadow-xl shadow-primary/5 sm:p-7 lg:h-[min(560px,calc(100dvh-2.5rem))]">
          <div className="lg:hidden">
            <img
              src={brandLogo}
              alt="Vikasita Keralam"
              className="h-14 w-auto object-contain object-left"
            />
          </div>
          <div className="mt-6 lg:mt-0">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Administrator access
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use your authorised administrator credentials to open the operations workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Username</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="email"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Administrator email"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Password</span>
              <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                <LockKeyhole className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-muted-foreground hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Verifying…" : "Sign in"}{" "}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
            <span>Authorised users only</span>
            <Link to="/" className="font-semibold text-primary hover:underline">
              Return to public portal
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
