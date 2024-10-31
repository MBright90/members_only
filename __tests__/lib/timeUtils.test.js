/* eslint-disable no-undef */
const { formatTimeAgo } = require("../../lib/timeUtils");

describe("formatTimeAgo", () => {
  let now;

  beforeEach(() => {
    now = Date.now();
  });

  it("returns a string with s as the unit of time", () => {
    const tenSecondsAgo = new Date(now - 1000 * 10);
    const result = formatTimeAgo(tenSecondsAgo);

    expect(result).toEqual("10s ago");
  });

  it("returns a string with m as the unit of time", () => {
    const tenMinutesAgo = new Date(now - 1000 * 60 * 10);
    const result = formatTimeAgo(tenMinutesAgo);

    expect(result).toEqual("10m ago");
  });

  it("returns a string with h as the unit of time", () => {
    const fiveHoursAgo = new Date(now - 1000 * 60 * 60 * 5);
    const result = formatTimeAgo(fiveHoursAgo);

    expect(result).toEqual("5h ago");
  });

  it("returns a string with d as the unit of time", () => {
    const threeDaysAgo = new Date(now - 1000 * 60 * 60 * 72);
    const result = formatTimeAgo(threeDaysAgo);

    expect(result).toEqual("3d ago");
  });

  it("returns a string with y as the unit of time", () => {
    const twoYearsAgo = new Date(now - 1000 * 60 * 60 * 24 * 365 * 2);
    const result = formatTimeAgo(twoYearsAgo);

    expect(result).toEqual("2y ago");
  });

  it("returns an empty string if passed an invalid timeStamp - string", () => {
    const invalidTimeStamp = "invalidTimeStamp";
    const result = formatTimeAgo(invalidTimeStamp);

    expect(result).toEqual("");
  });

  it("returns an empty string if passed an invalid timeStamp - int", () => {
    const invalidTimeStamp = 101;
    const result = formatTimeAgo(invalidTimeStamp);

    expect(result).toEqual("");
  });
});
