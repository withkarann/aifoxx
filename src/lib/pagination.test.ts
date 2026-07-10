import { describe, it, expect } from "vitest";
import { paginationItems } from "./pagination";

describe("paginationItems", () => {
  it("shows every page when there are seven or fewer", () => {
    expect(paginationItems(1, 1)).toEqual([1]);
    expect(paginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("truncates the middle when on the first page of many", () => {
    expect(paginationItems(1, 91)).toEqual([1, 2, "ellipsis", 91]);
  });

  it("keeps one neighbor on each side of the current page", () => {
    expect(paginationItems(45, 91)).toEqual([1, "ellipsis", 44, 45, 46, "ellipsis", 91]);
  });

  it("truncates only the left side near the end", () => {
    expect(paginationItems(91, 91)).toEqual([1, "ellipsis", 90, 91]);
  });

  it("omits the ellipsis when the window touches the edges", () => {
    expect(paginationItems(3, 8)).toEqual([1, 2, 3, 4, "ellipsis", 8]);
  });
});
