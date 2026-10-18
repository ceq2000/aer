import type { State } from "./model";

export const seed: State = {
  weeklyBudget: 500,
  budgetLocked: false,
  scanned: false,
  competitors: [
    { brand: "Spinwell", daysActive: 3, spend: 0 },
    { brand: "Hush Audio", daysActive: 47, spend: 7758 },
    { brand: "Oakwave", daysActive: 2, spend: 0 },
    { brand: "Vinyl Haus", daysActive: 61, spend: 10869 },
    { brand: "Copperline", daysActive: 5, spend: 0 },
    { brand: "Northtone", daysActive: 38, spend: 6272 },
    { brand: "Fieldnote", daysActive: 1, spend: 0 },
    { brand: "Ember Sound", daysActive: 9, spend: 0 },
    { brand: "Gridline", daysActive: 72, spend: 11885 },
  ],
  ads: [],
  messages: [
    { id: 1, author: "Tasha", channel: "instagram", kind: "comment", text: "That walnut finish is unreal", tag: "fan", sourceAd: null },
    { id: 2, author: "Kenji", channel: "tiktok", kind: "comment", text: "what record is this??", tag: "question", sourceAd: null },
  ],
  leads: [],
  notifications: [],
  nextId: 100,
};

export const inboundScript = [
  { author: "Omar", channel: "facebook", kind: "dm", text: "How much for this setup?" },
  { author: "Lena", channel: "instagram", kind: "comment", text: "saving this for later" },
  { author: "Marcus", channel: "instagram", kind: "dm", text: "Do you ship to Canada?" },
  { author: "Priya", channel: "tiktok", kind: "comment", text: "goals." },
  { author: "Diego", channel: "facebook", kind: "comment", text: "Is the amp sold separately?" },
] as const;
