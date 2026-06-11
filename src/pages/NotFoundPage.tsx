import { Link } from "react-router-dom";
import { PageMeta } from "@/components/seo/PageMeta";
import Brand from "@/lib/brand";

export default function NotFoundPage() {
  return (
    <>
      <PageMeta
        title="404 | Page Not Found | AIFOXX"
        description="The page you're looking for doesn't exist. Browse 1000+ AI tools at AIFOXX."
        url={`https://${Brand.product.domain}/404`}
        robots="noindex, nofollow"
      />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display font-black text-6xl text-accent-red">
            &gt; ERROR_404
          </h1>
          <p className="font-display text-2xl text-text-secondary mt-2">
            &gt; PAGE_NOT_FOUND
          </p>
          <span className="inline-block animate-blink text-accent-red font-display text-2xl">|</span>
          <div className="mt-8">
            <Link
              to="/"
              className="font-mono text-accent-green hover:underline transition-colors duration-150"
            >
              &gt; cd ~/ [RETURN_HOME]
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
