import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageMeta } from "@/components/seo/PageMeta";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Brand from "@/lib/brand";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (displayName.trim().length < 2) { setError("Display name must be at least 2 characters."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error } = await signUp(email, password, displayName.trim());
    setLoading(false);
    if (error) { setError(error); return; }
    navigate(redirect);
  };

  return (
    <>
      <PageMeta title={`Sign Up | ${Brand.product.name_styled}`} description="Create your AIFoxx account." />
      <div className="flex-1 flex items-start justify-center px-4 py-16">
        <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 w-full max-w-sm space-y-6 font-mono">
          <div>
            <p className="text-xs text-text-muted tracking-widest">// AUTH</p>
            <h1 className="font-display font-black text-3xl text-text-primary mt-1">CREATE ACCOUNT</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted tracking-widest">DISPLAY NAME</label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} required maxLength={40} placeholder="How you'll appear on comments" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted tracking-widest">EMAIL</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted tracking-widest">PASSWORD</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} />
            </div>
            {error && <p className="text-xs text-accent-red font-mono">&gt; ERROR: {error}</p>}
            <Button type="submit" disabled={loading} className="w-full font-display font-black tracking-widest">
              {loading ? "CREATING..." : ">> CREATE ACCOUNT"}
            </Button>
          </form>
          <p className="text-xs text-text-muted text-center">
            Already have an account?{" "}
            <Link to={`/sign-in?redirect=${encodeURIComponent(redirect)}`} className="text-accent-green hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
