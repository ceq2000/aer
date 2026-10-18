import { describe, expect, it } from "vitest";
import { attribution, classify, reducer, totalSpend } from "./store";
import { seed } from "./seed";
import type { State } from "./model";

const withAds = (s: State = seed) => reducer(reducer(s, { type: "scanCompetitors" }), { type: "generateAds" });

describe("growth team rules", () => {
  it("classifies buyer intent", () => {
    expect(classify("How much for this setup?")).toBe("buyer");
    expect(classify("Do you ship to Canada?")).toBe("buyer");
    expect(classify("saving this for later")).toBe("fan");
  });

  it("refuses approval until the budget is locked", () => {
    const s = reducer(withAds(), { type: "approveAll" });
    expect(s.ads.every((a) => a.status === "pending")).toBe(true);
  });

  it("never allocates more than the locked weekly budget", () => {
    let s = reducer(withAds(), { type: "toggleLock" });
    s = reducer(s, { type: "approveAll" });
    expect(s.ads.every((a) => a.status === "live")).toBe(true);
    expect(totalSpend(s.ads)).toBeLessThanOrEqual(500);
  });

  it("creates a lead for a buyer message, books within the SLA, and attributes revenue", () => {
    let s = reducer(reducer(withAds(), { type: "toggleLock" }), { type: "approveAll" });
    const adId = s.ads[0]!.id;
    s = reducer(s, { type: "incoming", message: { author: "Marcus", channel: "instagram", kind: "dm", text: "Do you ship to Canada?", sourceAd: adId } });
    const lead = s.leads[0]!;
    expect(reducer(s, { type: "callLead", id: lead.id, seconds: 90 }).leads[0]!.status).toBe("new");
    s = reducer(s, { type: "callLead", id: lead.id, seconds: 47 });
    s = reducer(s, { type: "closeLead", id: lead.id, dealSize: 24800 });
    expect(attribution(s)[0]!.revenue).toBe(24800);
    expect(s.notifications).toHaveLength(1);
  });
});
