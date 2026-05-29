import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export interface SearchBarHandle {
  focus: () => void;
}

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(
  function SearchBar({ value, onChange }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    // Global "/" shortcut
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, []);

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
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="search_tools..."
            aria-label="Search AI tools"
            className="bg-transparent text-text-primary font-mono text-sm flex-1 outline-none placeholder:text-text-muted py-2.5 caret-accent-green"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="text-text-muted hover:text-text-primary transition-colors duration-150 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);
