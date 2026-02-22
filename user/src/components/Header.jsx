import { Link, useLocation } from "react-router-dom";

const tabs = [
  { label: "Discover", path: "/" },
  { label: "Upload", path: "/upload" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <div className="glass-panel rounded-3xl px-5 py-4 md:px-7 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-ink)]">
                Community Streaming
              </p>
              <h1 className="font-display text-2xl font-extrabold text-[var(--ink)] md:text-3xl">
               Sharing is caring.
              </h1>
            </div>

            <nav className="inline-flex rounded-full border border-[var(--line)] bg-white/80 p-1">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;

                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`nav-pill ${
                      isActive
                        ? "bg-[var(--ink)] text-white shadow-sm"
                        : "text-[var(--ink)]/70 hover:text-[var(--ink)]"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
