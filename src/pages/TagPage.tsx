import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { allTools } from "@/lib/tools";
import { ToolCard } from "@/components/tools/ToolCard";
import { PageMeta } from "@/components/seo/PageMeta";
import { JsonLd } from "@/components/seo/JsonLd";
import Brand from "@/lib/brand";

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const tagValue = tag ?? "";
  const encodedTag = encodeURIComponent(tagValue);

  const tools = useMemo(() => allTools.filter((t) => t.tags.includes(tagValue)), [tagValue]);

  const tagSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `#${tagValue} AI Tools`,
    "description": `${tools.length} AI tools tagged with #${tagValue} on AIFOXX.`,
    "url": `https://${Brand.product.domain}/tag/${encodedTag}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": tools.slice(0, 25).map((tool, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": tool.name,
        "url": `https://${Brand.product.domain}/ai/${tool.slug}`,
      })),
    },
  }), [encodedTag, tagValue, tools]);

  return (
    <>
      <PageMeta
        title={`#${tagValue} AI Tools | ${Brand.product.name_styled}`}
        description={`${tools.length} AI tools tagged with #${tagValue}. Browse and compare.`}
        url={`https://${Brand.product.domain}/tag/${encodedTag}`}
        robots={tools.length === 0 ? "noindex, follow" : undefined}
      />
      <JsonLd schema={tagSchema} id="tag-collection" />
      <div className="max-w-5xl mx-auto w-full p-6 space-y-5">
        <div>
          <h1 className="font-display font-black text-3xl text-accent-green">&gt; #{tagValue}</h1>
          <p className="font-mono text-xs text-text-muted mt-1">{tools.length} tools tagged with this</p>
        </div>

        {tools.length === 0 ? (
          <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 text-center">
            <p className="font-display text-accent-green font-black">&gt; NO_RESULTS_FOUND</p>
            <p className="font-mono text-text-secondary text-sm mt-2">No tools found with this tag</p>
            <Link to="/" className="font-mono text-xs text-accent-green hover:underline mt-3 inline-block">&gt; cd ~/ [HOME]</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (<ToolCard key={tool.id} tool={tool} />))}
          </div>
        )}
      </div>
    </>
  );
}
