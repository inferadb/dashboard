import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, formatDate, formatDateTime, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const shouldInclude = true;
    const shouldExclude = false;
    expect(
      cn("base", shouldInclude && "included", shouldExclude && "excluded")
    ).toBe("base included");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date("2024-03-15T12:00:00Z");
    const result = formatDate(date);
    expect(result).toMatch(/Mar 15, 2024/);
  });

  it("formats an ISO date string", () => {
    const result = formatDate("2024-12-25T00:00:00Z");
    expect(result).toMatch(/Dec 2[45], 2024/); // Timezone may affect day
  });

  it("handles different months", () => {
    // Use full ISO timestamps to avoid timezone issues
    expect(formatDate("2024-01-15T12:00:00")).toMatch(/Jan/);
    expect(formatDate("2024-06-15T12:00:00")).toMatch(/Jun/);
    expect(formatDate("2024-12-15T12:00:00")).toMatch(/Dec/);
  });
});

describe("formatDateTime", () => {
  it("formats a Date object with time", () => {
    const date = new Date("2024-03-15T14:30:00");
    const result = formatDateTime(date);
    expect(result).toMatch(/Mar 15, 2024/);
    expect(result).toMatch(/:\d{2}/); // Contains time
  });

  it("formats an ISO date string with time", () => {
    const result = formatDateTime("2024-12-25T09:45:00");
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/2024/);
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for times less than 60 seconds ago', () => {
    const now = new Date("2024-03-15T12:00:00Z");
    vi.setSystemTime(now);

    const thirtySecondsAgo = new Date("2024-03-15T11:59:30Z");
    expect(formatRelativeTime(thirtySecondsAgo)).toBe("just now");
  });

  it("returns minutes ago for times less than 60 minutes ago", () => {
    const now = new Date("2024-03-15T12:00:00Z");
    vi.setSystemTime(now);

    const fiveMinutesAgo = new Date("2024-03-15T11:55:00Z");
    expect(formatRelativeTime(fiveMinutesAgo)).toBe("5m ago");

    const thirtyMinutesAgo = new Date("2024-03-15T11:30:00Z");
    expect(formatRelativeTime(thirtyMinutesAgo)).toBe("30m ago");
  });

  it("returns hours ago for times less than 24 hours ago", () => {
    const now = new Date("2024-03-15T12:00:00Z");
    vi.setSystemTime(now);

    const twoHoursAgo = new Date("2024-03-15T10:00:00Z");
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");

    const twentyThreeHoursAgo = new Date("2024-03-14T13:00:00Z");
    expect(formatRelativeTime(twentyThreeHoursAgo)).toBe("23h ago");
  });

  it("returns days ago for times less than 7 days ago", () => {
    const now = new Date("2024-03-15T12:00:00Z");
    vi.setSystemTime(now);

    const oneDayAgo = new Date("2024-03-14T12:00:00Z");
    expect(formatRelativeTime(oneDayAgo)).toBe("1d ago");

    const sixDaysAgo = new Date("2024-03-09T12:00:00Z");
    expect(formatRelativeTime(sixDaysAgo)).toBe("6d ago");
  });

  it("returns formatted date for times 7 or more days ago", () => {
    const now = new Date("2024-03-15T12:00:00Z");
    vi.setSystemTime(now);

    const eightDaysAgo = new Date("2024-03-07T12:00:00Z");
    const result = formatRelativeTime(eightDaysAgo);
    expect(result).toMatch(/Mar 7, 2024/);
  });

  it("handles string input", () => {
    const now = new Date("2024-03-15T12:00:00Z");
    vi.setSystemTime(now);

    expect(formatRelativeTime("2024-03-15T11:55:00Z")).toBe("5m ago");
  });
});
