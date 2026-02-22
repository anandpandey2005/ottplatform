import { Github, Globe, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mb-2">
      <div className="mx-auto max-w-6xl px-4">
        <div className="glass-panel rounded-3xl px-6 py-8 md:px-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--ink)] md:justify-start">
                Designed & Developed with{" "}
                <Heart size={14} className="fill-red-500 text-red-500" /> by
                <span className="font-bold underline decoration-[var(--line)] underline-offset-4">
                  Anand Pandey
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--muted-ink)] tracking-wide">
                &copy; {currentYear}Sharing is caring. All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://github.com/anandpandey2005/SharingIsCaring."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-white"
              >
                <Github size={16} />
                View Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
