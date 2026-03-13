import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border-dim bg-bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-3">
        <p className="font-mono text-xs text-text-muted tracking-wider">
          TOOLS_AI // OPEN SOURCE DIRECTORY
        </p>
        <div className="flex items-center gap-6 font-mono text-xs text-text-muted">
          <a
            href="https://github.com/withkarann"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-text-secondary transition-colors duration-150"
          >
            <Github size={14} />
            withkarann
          </a>
          <span>MIT License</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
