import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "@/lib/json-ld";

describe("serializeJsonLd", () => {
  it("escapes </script> in values so the payload cannot end the script block", () => {
    const schema = {
      "@type": "ListItem",
      name: 'Breaking</script><img src=x onerror="alert(1)">',
    };

    const json = serializeJsonLd(schema);

    expect(json).not.toContain("</script>");
    expect(json).not.toContain("<");
  });

  it("escapes line separators that are invalid inside inline scripts", () => {
    const json = serializeJsonLd({ name: "a\u2028b\u2029c" });

    expect(json).not.toContain("\u2028");
    expect(json).not.toContain("\u2029");
  });

  it("stays valid JSON that parses back to the original values", () => {
    const schema = {
      name: 'Breaking</script> news "quoted"',
      url: "https://example.com/a?b=1&c=2",
      position: 3,
    };

    expect(JSON.parse(serializeJsonLd(schema))).toEqual(schema);
  });
});
