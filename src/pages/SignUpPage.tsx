import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageMeta } from "@/components/seo/PageMeta";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Brand from "@/lib/brand";

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (displayName.trim().length < 2) { setError("Display name must be at least 2 characters."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const { error, needsConfirmation } = await signUp(email, password, displayName.trim());
    setLoading(false);
    if (error) { setError(error); return; }
    if (needsConfirmation) { setPendingConfirmation(true); return; }
    navigate(redirect);
  };

  if (pendingConfirmation) {
    return (
      <>
        <PageMeta title={`Confirm Email | ${Brand.product.name_styled}`} description="Check your email to confirm your account." />
        <div className="flex-1 flex items-start justify-center px-4 py-16">
          <div className="bg-bg-elevated border border-border-default rounded-[6px] p-8 w-full max-w-sm space-y-4 font-mono">
            <p className="text-xs text-text-muted tracking-widest">// AUTH</p>
            <h1 className="font-display font-black text-2xl text-text-primary">CHECK YOUR EMAIL</h1>
            <p className="text-sm text-text-secondary">
              We sent a confirmation link to <span className="text-accent-green">{email}</span>. Click it to activate your account, then sign in.
            </p>
            <Link to={`/sign-in?redirect=${encodeURIComponent(redirect)}`} className="block text-xs text-accent-green hover:underline">
              &gt; Go to sign in →
            </Link>
          </div>
        </div>
      </>
    );
  }

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
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-default" />
            <span className="text-xs text-text-muted">OR</span>
            <div className="flex-1 h-px bg-border-default" />
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-2 border border-border-default rounded-[4px] px-4 py-2 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

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
