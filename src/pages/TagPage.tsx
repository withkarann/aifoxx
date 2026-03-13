import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { allTools } from "@/lib/tools";
import { ToolCard } from "@/components/tools/ToolCard";

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();

  const tools = useMemo(
    () => allTools.filter((t) => t.tags.includes(tag || "")),
    [tag]
  );

  useEffect(() => {
    document.title = tag ? `#${tag} | ToolsAI` : "Tag | ToolsAI";
    return () => { document.title = "ToolsAI"; };
  }, [tag]);

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-5">
      <div>
        <h1 className="font-display font-black text-3xl text-accent-green">
          &gt; #{tag}
        </h1>
        <p className="font-mono text-xs text-text-muted mt-1">
          {tools.length} tools tagged with this
        </p>
      </div>

      {tools.length === 0 ? (
        <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 text-center">
          <p className="font-display text-accent-green font-black">&gt; NO_RESULTS_FOUND</p>
          <p className="font-mono text-text-secondary text-sm mt-2">No tools found with this tag</p>
          <Link to="/" className="font-mono text-xs text-accent-green hover:underline mt-3 inline-block">
            &gt; cd ~/ [HOME]
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
