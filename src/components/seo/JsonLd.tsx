import { useMemo } from "react";
import { Head } from "vite-react-ssg";
import { serializeJsonLd } from "@/lib/json-ld";

interface JsonLdProps {
  schema: Record<string, unknown>;
  id: string;
}

export function JsonLd({ schema, id }: JsonLdProps) {
  // Script children render unescaped, so the serializer must keep
  // untrusted values from ending the script block.
  const json = useMemo(() => serializeJsonLd(schema), [schema]);
  return (
    <Head>
      <script id={`json-ld-${id}`} type="application/ld+json">
        {json}
      </script>
    </Head>
  );
}
