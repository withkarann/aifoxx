import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl">
      <div
        className={cn(
          "flex items-center px-3 gap-2 bg-bg-elevated border border-border-default rounded-[6px] transition-all duration-150",
          "focus-within:border-border-active focus-within:shadow-glow"
        )}
      >
        <span className="text-accent-green font-mono font-bold select-none">&gt;</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="search_tools..."
          className="bg-transparent text-text-primary font-mono text-sm flex-1 outline-none placeholder:text-text-muted py-2.5 caret-accent-green"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-text-muted hover:text-text-primary transition-colors duration-150 text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
