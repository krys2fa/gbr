import { valuationUSD } from "./valuation";

describe("valuationUSD", () => {
  it("computes net value with default envs", () => {
    const res = valuationUSD(
      { karat: 24, weightGrams: 31.1034768, impuritiesPct: 0 },
      { spotUSD: 2000, feeBps: 50 }
    );
    // 1 oz pure at $2000, fee 0.5% => 1990
    expect(Number(res.net.toFixed(2))).toBe(1990.0);
  });

  it("reduces value for lower karat and impurities", () => {
    const res = valuationUSD(
      { karat: 18, weightGrams: 100, impuritiesPct: 5 },
      { spotUSD: 2400, feeBps: 100 }
    );
    expect(res.net).toBeGreaterThan(0);
  });
});
