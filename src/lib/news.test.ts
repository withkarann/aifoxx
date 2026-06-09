import { describe, it, expect } from "vitest";
import { groupNewsByDate, formatAbsoluteDate } from "@/lib/news";
import type { NewsItem } from "@/types/news";

// Fixed reference time: 2026-06-03T12:00:00Z (noon UTC)
const NOW = new Date("2026-06-03T12:00:00Z").getTime();

function makeItem(id: string, date: string): NewsItem {
  return {
    id,
    title: `Item ${id}`,
    url: `https://example.com/${id}`,
    domain: "example.com",
    source: "hn",
    category: "news",
    date,
  };
}

describe("groupNewsByDate", () => {
  it("returns empty array for empty input", () => {
    expect(groupNewsByDate([], NOW)).toEqual([]);
  });

  it("buckets items into correct groups", () => {
    const today = makeItem("today", "2026-06-03T06:00:00Z"); // same calendar day
    const yesterday = makeItem("yesterday", "2026-06-02T10:00:00Z"); // prior calendar day
    const thisWeek = makeItem("this-week", "2026-05-31T08:00:00Z"); // 3 days ago
    const earlier = makeItem("earlier", "2026-05-14T08:00:00Z"); // 20 days ago

    const groups = groupNewsByDate([today, yesterday, thisWeek, earlier], NOW);

    expect(groups).toHaveLength(4);
    expect(groups[0].label).toBe("Today");
    expect(groups[0].items).toEqual([today]);
    expect(groups[1].label).toBe("Yesterday");
    expect(groups[1].items).toEqual([yesterday]);
    expect(groups[2].label).toBe("This Week");
    expect(groups[2].items).toEqual([thisWeek]);
    expect(groups[3].label).toBe("Earlier");
    expect(groups[3].items).toEqual([earlier]);
  });

  it("omits empty buckets and returns only non-empty ones in fixed order", () => {
    const today = makeItem("t1", "2026-06-03T08:00:00Z");
    const earlier = makeItem("e1", "2026-04-01T08:00:00Z");

    const groups = groupNewsByDate([today, earlier], NOW);

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe("Today");
    expect(groups[1].label).toBe("Earlier");
    // Yesterday and This Week are missing
    expect(groups.find((g) => g.label === "Yesterday")).toBeUndefined();
    expect(groups.find((g) => g.label === "This Week")).toBeUndefined();
  });

  it("preserves input order within each bucket", () => {
    const a = makeItem("a", "2026-06-03T02:00:00Z");
    const b = makeItem("b", "2026-06-03T08:00:00Z");
    const c = makeItem("c", "2026-06-03T11:00:00Z");

    const groups = groupNewsByDate([a, b, c], NOW);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Today");
    expect(groups[0].items).toEqual([a, b, c]);
  });

  it("puts items with unparseable dates into Earlier", () => {
    const bad = makeItem("bad", "not-a-date");
    const groups = groupNewsByDate([bad], NOW);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Earlier");
    expect(groups[0].items).toEqual([bad]);
  });

  it("output order is always Today → Yesterday → This Week → Earlier", () => {
    // Only Yesterday and Earlier items — no Today or This Week
    const yesterday = makeItem("y", "2026-06-02T06:00:00Z");
    const earlier = makeItem("e", "2026-01-01T06:00:00Z");

    const groups = groupNewsByDate([earlier, yesterday], NOW); // input in reverse order

    expect(groups[0].label).toBe("Yesterday");
    expect(groups[1].label).toBe("Earlier");
  });

  it("handles a single Today item", () => {
    const item = makeItem("solo", "2026-06-03T00:01:00Z");
    const groups = groupNewsByDate([item], NOW);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Today");
  });

  it("This Week boundary: exactly 6 days before start of today is still This Week", () => {
    // startOfToday (UTC) = 2026-06-03T00:00:00Z
    // 6 days before = 2026-05-28T00:00:00Z — should land in This Week
    const item = makeItem("boundary", "2026-05-28T00:00:00Z");
    const groups = groupNewsByDate([item], NOW);
    expect(groups[0].label).toBe("This Week");
  });

  it("Earlier boundary: 7 days before start of today falls into Earlier", () => {
    // 7 days before startOfToday = 2026-05-27T00:00:00Z — should be Earlier (not in 6-day window)
    const item = makeItem("boundary2", "2026-05-27T00:00:00Z");
    const groups = groupNewsByDate([item], NOW);
    expect(groups[0].label).toBe("Earlier");
  });

  it("data-derived default: newest item lands in Today, item 10 days older lands in Earlier", () => {
    // No referenceMs passed — function must self-derive from the data
    const newest = makeItem("newest", "2026-06-03T09:00:00Z");
    const older = makeItem("older", "2026-05-24T09:00:00Z"); // 10 days before newest
    const groups = groupNewsByDate([newest, older]);
    // newest is the reference; its own UTC day is "Today"
    expect(groups.find((g) => g.label === "Today")?.items).toEqual([newest]);
    // 10 days before reference is well outside the 6-day This Week window → Earlier
    expect(groups.find((g) => g.label === "Earlier")?.items).toEqual([older]);
  });
});

describe("formatAbsoluteDate", () => {
  it("renders the calendar date in UTC, independent of runtime timezone", () => {
    // An instant just after UTC midnight resolves to the same date everywhere.
    expect(formatAbsoluteDate("2026-06-03T01:07:00.000Z")).toBe("Jun 3, 2026");
    // An instant just before UTC midnight stays on its UTC date everywhere.
    expect(formatAbsoluteDate("2026-06-02T23:30:00.000Z")).toBe("Jun 2, 2026");
  });

  it("returns an empty string for an unparseable date", () => {
    expect(formatAbsoluteDate("not-a-date")).toBe("");
  });
});
