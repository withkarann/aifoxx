import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import type { Comment } from "@/types/comment";

interface Props {
  toolSlug: string;
}

export function CommentSection({ toolSlug }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("comments")
      .select("*")
      .eq("tool_slug", toolSlug)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setComments(data); });
  }, [toolSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    const authorName = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "User";
    const { data, error } = await supabase
      .from("comments")
      .insert({ tool_slug: toolSlug, user_id: user.id, author_name: authorName, body: trimmed })
      .select()
      .single();
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setComments(prev => [data, ...prev]);
    setBody("");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="mt-8 space-y-4">
      <div className="h-px w-full bg-border-default" />
      <p className="font-mono text-xs text-text-muted tracking-widest">
        // COMMENTS ({comments.length})
      </p>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value.slice(0, 500))}
            placeholder="> share your thoughts..."
            rows={3}
            className="w-full bg-bg-surface border border-border-default rounded-[4px] px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-green/50 transition-colors duration-150"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted">{body.length}/500</span>
            <Button type="submit" disabled={submitting || !body.trim()} size="sm" className="font-display font-black tracking-widest text-xs">
              {submitting ? "POSTING..." : ">> POST"}
            </Button>
          </div>
          {error && <p className="font-mono text-xs text-accent-red">&gt; ERROR: {error}</p>}
        </form>
      ) : (
        <div className="bg-bg-surface border border-border-default rounded-[4px] px-4 py-3 font-mono text-sm text-text-secondary">
          <Link to={`/sign-in?redirect=/ai/${toolSlug}`} className="text-accent-green hover:underline">
            Sign in
          </Link>{" "}
          to leave a comment.
        </div>
      )}

      {comments.length === 0 ? (
        <p className="font-mono text-xs text-text-muted">&gt; No comments yet. Be the first.</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-bg-surface border border-border-default rounded-[4px] px-4 py-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-accent-green">&gt; {c.author_name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-text-muted">{formatDate(c.created_at)}</span>
                  {user?.id === c.user_id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-text-muted hover:text-accent-red transition-colors duration-150"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className="font-mono text-sm text-text-secondary whitespace-pre-wrap break-words">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
