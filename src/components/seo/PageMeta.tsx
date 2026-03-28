import { Head } from "vite-react-ssg";

interface PageMetaProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export function PageMeta({ title, description, url, image }: PageMetaProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {image && <meta name="twitter:image" content={image} />}
    </Head>
  );
}
