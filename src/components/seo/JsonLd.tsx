import { useMemo } from "react";
import { Head } from "vite-react-ssg";

interface JsonLdProps {
  schema: Record<string, unknown>;
  id: string;
}

export function JsonLd({ schema, id }: JsonLdProps) {
  const json = useMemo(() => JSON.stringify(schema), [schema]);
  return (
    <Head>
      <script id={`json-ld-${id}`} type="application/ld+json">
        {json}
      </script>
    </Head>
  );
}
