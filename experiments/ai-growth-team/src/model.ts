export type AdStatus = "pending" | "live" | "rejected";
export type Channel = "instagram" | "tiktok" | "facebook";
export type Tag = "fan" | "buyer" | "question";
export type LeadStatus = "new" | "calling" | "booked" | "paid";

export interface CompetitorAd {
  brand: string;
  daysActive: number;
  spend: number;
}

export interface Ad {
  id: number;
  hook: string;
  status: AdStatus;
  spend: number;
  leads: number;
  calls: number;
  revenue: number;
}

export interface Message {
  id: number;
  author: string;
  channel: Channel;
  kind: "comment" | "dm";
  text: string;
  tag: Tag | null;
  sourceAd: number | null;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  city: string;
  sourceAd: number | null;
  status: LeadStatus;
  dealSize: number;
  callSeconds: number | null;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
}

export interface State {
  weeklyBudget: number;
  budgetLocked: boolean;
  competitors: CompetitorAd[];
  scanned: boolean;
  ads: Ad[];
  messages: Message[];
  leads: Lead[];
  notifications: Notification[];
  nextId: number;
}

export const BIG_DEAL = 10_000;
export const CALL_SLA_SECONDS = 60;
