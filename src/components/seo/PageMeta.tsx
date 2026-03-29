import { Head } from "vite-react-ssg";
import Brand from "@/lib/brand";

interface PageMetaProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  keywords?: string[];
}

function toAbsoluteUrl(input: string) {
  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  const path = input.startsWith("/") ? input : `/${input}`;
  return `https://${Brand.product.domain}${path}`;
}

export function PageMeta({ title, description, url, image, type = "website", robots, keywords }: PageMetaProps) {
  const canonicalUrl = url ? toAbsoluteUrl(url) : undefined;
  const socialImage = toAbsoluteUrl(image ?? Brand.seo?.og_image ?? "/aifoxx.png");

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      {robots && <meta name="robots" content={robots} />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={Brand.product.name_styled} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={socialImage} />
      <meta name="twitter:image" content={socialImage} />
    </Head>
  );
}
