import {
  BIG_DEAL,
  CALL_SLA_SECONDS,
  type Ad,
  type Lead,
  type Message,
  type State,
  type Tag,
} from "./model";

export type Action =
  | { type: "setBudget"; amount: number }
  | { type: "toggleLock" }
  | { type: "scanCompetitors" }
  | { type: "generateAds" }
  | { type: "approveAll" }
  | { type: "approveAd"; id: number }
  | { type: "rejectAd"; id: number }
  | { type: "incoming"; message: Omit<Message, "id" | "tag"> }
  | { type: "triage" }
  | { type: "callLead"; id: number; seconds: number }
  | { type: "closeLead"; id: number; dealSize: number };

export function classify(text: string): Tag {
  const t = text.toLowerCase();
  if (/(how much|price|ship|cost|buy|sold separately|quote|in stock)/.test(t)) return "buyer";
  if (/\?/.test(t)) return "question";
  return "fan";
}

export const hooks = [
  "Hear every crackle.",
  "Warm tubes. Cold nights.",
  "Built from walnut.",
  "Sound you can feel.",
  "Your records deserve better.",
];

/** Budget allocation: spend is capped at weeklyBudget when locked, proportional to performance. */
export function allocate(state: State): Ad[] {
  const live = state.ads.filter((a) => a.status === "live");
  if (live.length === 0) return state.ads;
  const cap = state.budgetLocked ? state.weeklyBudget : Infinity;
  const totalRevenue = live.reduce((s, a) => s + a.revenue, 0);
  const weights = live.map((a) => (totalRevenue > 0 ? 0.2 + a.revenue / totalRevenue : 1));
  const sum = weights.reduce((s, w) => s + w, 0);
  const shares = new Map(live.map((a, i) => [a.id, ((weights[i] ?? 0) / sum) * cap]));
  return state.ads.map((a) => (a.status === "live" && Number.isFinite(cap) ? { ...a, spend: round(shares.get(a.id) ?? 0) } : a));
}

export function totalSpend(ads: Ad[]): number {
  return round(ads.reduce((s, a) => s + a.spend, 0));
}

const round = (n: number) => Math.round(n * 100) / 100;

export function attribution(state: State) {
  return state.ads
    .filter((a) => a.status === "live")
    .map((a) => {
      const customers = state.leads.filter((l) => l.sourceAd === a.id && (l.status === "paid" || l.status === "booked"));
      const revenue = state.leads.filter((l) => l.sourceAd === a.id && l.status === "paid").reduce((s, l) => s + l.dealSize, 0);
      return { ...a, leads: state.leads.filter((l) => l.sourceAd === a.id).length, calls: state.leads.filter((l) => l.sourceAd === a.id && l.callSeconds !== null).length, customers: customers.length, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setBudget":
      return { ...state, weeklyBudget: Math.max(0, Math.floor(action.amount)) };
    case "toggleLock":
      return { ...state, budgetLocked: !state.budgetLocked };
    case "scanCompetitors":
      return { ...state, scanned: true };
    case "generateAds": {
      let id = state.nextId;
      const fresh: Ad[] = hooks.map((hook) => ({ id: id++, hook, status: "pending", spend: 0, leads: 0, calls: 0, revenue: 0 }));
      return { ...state, ads: [...state.ads, ...fresh], nextId: id };
    }
    case "approveAd":
    case "approveAll": {
      // Nothing goes live without approval, and nothing goes live without a locked budget.
      if (!state.budgetLocked || state.weeklyBudget <= 0) return state;
      const ads = state.ads.map((a) =>
        a.status === "pending" && (action.type === "approveAll" || a.id === action.id) ? { ...a, status: "live" as const } : a,
      );
      return { ...state, ads: allocate({ ...state, ads }) };
    }
    case "rejectAd":
      return { ...state, ads: state.ads.map((a) => (a.id === action.id && a.status === "pending" ? { ...a, status: "rejected" } : a)) };
    case "incoming": {
      const tag = classify(action.message.text);
      const message: Message = { ...action.message, id: state.nextId, tag };
      let nextId = state.nextId + 1;
      let leads = state.leads;
      let notifications = state.notifications;
      if (tag === "buyer") {
        const lead: Lead = {
          id: nextId++,
          name: action.message.author,
          phone: "(416) 555-0148",
          city: "Toronto",
          sourceAd: action.message.sourceAd,
          status: "new",
          dealSize: 0,
          callSeconds: null,
        };
        leads = [lead, ...leads];
      }
      return { ...state, messages: [message, ...state.messages], leads, notifications, nextId };
    }
    case "triage":
      return {
        ...state,
        messages: state.messages.map((m) => (m.tag ? m : { ...m, tag: classify(m.text) })),
      };
    case "callLead": {
      if (action.seconds > CALL_SLA_SECONDS) return state;
      return { ...state, leads: state.leads.map((l) => (l.id === action.id && l.status === "new" ? { ...l, status: "booked", callSeconds: action.seconds } : l)) };
    }
    case "closeLead": {
      const lead = state.leads.find((l) => l.id === action.id);
      if (!lead || lead.status !== "booked") return state;
      const leads = state.leads.map((l) => (l.id === action.id ? { ...l, status: "paid" as const, dealSize: action.dealSize } : l));
      const notifications =
        action.dealSize >= BIG_DEAL
          ? [{ id: state.nextId, title: `BIG DEAL · $${action.dealSize.toLocaleString()}`, body: `${lead.name} · listening session booked` }, ...state.notifications]
          : state.notifications;
      return { ...state, leads, notifications, nextId: state.nextId + 1 };
    }
  }
}
