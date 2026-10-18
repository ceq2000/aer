import { useEffect, useReducer, useRef, useState } from "react";
import { BIG_DEAL, CALL_SLA_SECONDS, type Lead } from "./model";
import { attribution, reducer, totalSpend } from "./store";
import { inboundScript, seed } from "./seed";

const tabs = ["Overview", "Ads", "Inbox", "Sales", "Data"] as const;
type Tab = (typeof tabs)[number];
const usd = (n: number) => `$${n.toLocaleString()}`;

export function App() {
  const [state, dispatch] = useReducer(reducer, seed);
  const [tab, setTab] = useState<Tab>("Overview");
  const pending = state.ads.filter((a) => a.status === "pending").length;
  const newLeads = state.leads.filter((l) => l.status === "new").length;

  return (
    <div className="app">
      <header>
        <h1>Growth Team</h1>
        <span className="sub">Claude writes. Jev decides. ElevenLabs talks. You approve.</span>
      </header>
      <nav>
        {tabs.map((t) => (
          <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>
            {t}
            {t === "Ads" && pending > 0 && <b>{pending}</b>}
            {t === "Sales" && newLeads > 0 && <b>{newLeads}</b>}
          </button>
        ))}
      </nav>
      {state.notifications.map((n) => (
        <div className="toast" key={n.id}>
          <strong>{n.title}</strong> {n.body}
        </div>
      ))}
      <main>
        {tab === "Overview" && <Overview state={state} />}
        {tab === "Ads" && <Ads state={state} dispatch={dispatch} />}
        {tab === "Inbox" && <Inbox state={state} dispatch={dispatch} />}
        {tab === "Sales" && <Sales state={state} dispatch={dispatch} />}
        {tab === "Data" && <Data state={state} />}
      </main>
    </div>
  );
}

type Props = { state: typeof seed; dispatch: React.Dispatch<Parameters<typeof reducer>[1]> };

function Overview({ state }: { state: typeof seed }) {
  const rows = attribution(state);
  const spend = totalSpend(state.ads);
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const booked = state.leads.filter((l) => l.status === "booked" || l.status === "paid").length;
  const calls = state.leads.filter((l) => l.callSeconds !== null).length;
  const max = Math.max(1, ...rows.map((r) => r.revenue));
  return (
    <>
      <div className="kpis">
        <Kpi label="Ad spend" value={usd(spend)} note={`of ${usd(state.weeklyBudget)} limit`} />
        <Kpi label="New buyers" value={String(state.leads.length)} />
        <Kpi label="Calls made" value={String(calls)} />
        <Kpi label="Booked" value={String(booked)} />
        <Kpi label="Revenue" value={usd(revenue)} note={spend > 0 ? `${Math.round(revenue / spend)}x return` : "no spend yet"} />
      </div>
      <div className="grid2">
        <section>
          <h2>Top ads by revenue</h2>
          {rows.length === 0 && <p className="muted">No live ads. Approve ads on the Ads tab.</p>}
          {rows.map((r) => (
            <div className="bar" key={r.id}>
              <span>#{String(r.id).padStart(2, "0")}</span>
              <i style={{ width: `${(r.revenue / max) * 100}%` }} />
              <em>{usd(r.revenue)}</em>
            </div>
          ))}
        </section>
        <section>
          <h2>Deals this week</h2>
          {state.leads.filter((l) => l.status === "paid" || l.status === "booked").length === 0 && <p className="muted">No deals yet.</p>}
          {state.leads
            .filter((l) => l.status === "paid" || l.status === "booked")
            .map((l) => (
              <div className="row" key={l.id}>
                <span>{l.name}</span>
                <span>{l.status === "paid" ? usd(l.dealSize) : "booked"}</span>
              </div>
            ))}
        </section>
      </div>
    </>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

function Ads({ state, dispatch }: Props) {
  const spend = totalSpend(state.ads);
  const canApprove = state.budgetLocked && state.weeklyBudget > 0;
  return (
    <>
      <section>
        <h2>Ads Manager · budget</h2>
        <div className="budget">
          <span>$</span>
          <input
            type="number"
            min={0}
            value={state.weeklyBudget}
            disabled={state.budgetLocked}
            onChange={(e) => dispatch({ type: "setBudget", amount: Number(e.target.value) })}
          />
          <span>per week</span>
          <label>
            <input type="checkbox" checked={state.budgetLocked} onChange={() => dispatch({ type: "toggleLock" })} />
            Never spend over {usd(state.weeklyBudget)} / week
          </label>
        </div>
        {state.budgetLocked && <p className="ok">Budget locked · ads can't overspend ({usd(spend)} allocated)</p>}
      </section>
      <section>
        <h2>1 · Jev scans competitor ads</h2>
        <button onClick={() => dispatch({ type: "scanCompetitors" })}>Scan competitor ads</button>
        {state.scanned && (
          <div className="competitors">
            {[...state.competitors]
              .sort((a, b) => b.daysActive - a.daysActive)
              .map((c) => (
                <div key={c.brand} className={c.spend > 0 ? "winner" : "dim"}>
                  <strong>{c.brand}</strong>
                  <span>Active {c.daysActive} days</span>
                  {c.spend > 0 && <em>{usd(c.spend)} spent</em>}
                </div>
              ))}
          </div>
        )}
        <p className="muted">Ads running longest with real spend are the proven winners.</p>
      </section>
      <section>
        <h2>2 · Claude writes · 3 · Higgsfield shoots · 4 · ElevenLabs voices</h2>
        <button disabled={!state.scanned} onClick={() => dispatch({ type: "generateAds" })}>
          Generate 5 ads from winners
        </button>
      </section>
      <section>
        <h2>5 · Approvals {!canApprove && <small className="muted">(lock a budget first)</small>}</h2>
        <button disabled={!canApprove || !state.ads.some((a) => a.status === "pending")} onClick={() => dispatch({ type: "approveAll" })}>
          Approve all pending
        </button>
        <div className="adlist">
          {state.ads.map((a) => (
            <div className={`ad ${a.status}`} key={a.id}>
              <strong>#{String(a.id).padStart(2, "0")}</strong>
              <span>{a.hook}</span>
              <em>{a.status === "live" ? usd(a.spend) : a.status}</em>
              {a.status === "pending" && (
                <span>
                  <button disabled={!canApprove} onClick={() => dispatch({ type: "approveAd", id: a.id })}>Approve</button>
                  <button onClick={() => dispatch({ type: "rejectAd", id: a.id })}>Reject</button>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Inbox({ state, dispatch }: Props) {
  const sent = useRef(0);
  const live = attribution(state)[0];
  const next = () => {
    const item = inboundScript[sent.current % inboundScript.length];
    if (!item) return;
    sent.current += 1;
    dispatch({ type: "incoming", message: { ...item, sourceAd: live?.id ?? null } });
  };
  return (
    <section>
      <h2>All comments + DMs · {state.messages.length}</h2>
      <button onClick={next}>Simulate incoming message</button>
      <button onClick={() => dispatch({ type: "triage" })}>Run triage</button>
      {state.messages.map((m) => (
        <div className={`msg ${m.tag ?? ""}`} key={m.id}>
          <strong>
            {m.author} · {m.kind} · {m.channel}
          </strong>
          <span>{m.text}</span>
          {m.tag && <em className={m.tag}>{m.tag}</em>}
        </div>
      ))}
    </section>
  );
}

function Sales({ state, dispatch }: Props) {
  return (
    <section>
      <h2>Voice agent · buyers called within {CALL_SLA_SECONDS} seconds</h2>
      {state.leads.length === 0 && <p className="muted">No buyers yet. Simulate buyer messages in the Inbox.</p>}
      {state.leads.map((l) => (
        <LeadCard key={l.id} lead={l} dispatch={dispatch} />
      ))}
    </section>
  );
}

function LeadCard({ lead, dispatch }: { lead: Lead; dispatch: Props["dispatch"] }) {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [deal, setDeal] = useState(BIG_DEAL);
  useEffect(() => {
    if (elapsed === null) return;
    const done = elapsed >= 24;
    const t = setTimeout(() => (done ? dispatch({ type: "callLead", id: lead.id, seconds: 24 + (lead.id % 24) }) : setElapsed(elapsed + 4)), 150);
    return () => clearTimeout(t);
  }, [elapsed, lead.id, dispatch]);
  return (
    <div className="lead">
      <strong>
        {lead.name} · {lead.phone} · {lead.city}
      </strong>
      <span className="tag">{lead.status}</span>
      {lead.status === "new" && (
        <button disabled={elapsed !== null} onClick={() => setElapsed(0)}>
          {elapsed === null ? "Voice agent calls now" : `calling… 0:${String(elapsed).padStart(2, "0")}`}
        </button>
      )}
      {lead.status === "booked" && (
        <>
          <span>Listening session Sat 11:00 · called back in {lead.callSeconds}s</span>
          <input type="number" value={deal} onChange={(e) => setDeal(Number(e.target.value))} />
          <button onClick={() => dispatch({ type: "closeLead", id: lead.id, dealSize: deal })}>Mark paid</button>
        </>
      )}
      {lead.status === "paid" && <span>Paid {usd(lead.dealSize)}</span>}
    </div>
  );
}

function Data({ state }: { state: typeof seed }) {
  const rows = attribution(state);
  return (
    <section>
      <h2>growth.db · ad attribution</h2>
      <pre>{`SELECT ad, spend, leads, calls, customers, revenue
FROM ads JOIN comments JOIN calls
ORDER BY revenue DESC`}</pre>
      <table>
        <thead>
          <tr>
            {["ad", "spend", "leads", "calls", "customers", "revenue"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>#{r.id}</td>
              <td>{usd(r.spend)}</td>
              <td>{r.leads}</td>
              <td>{r.calls}</td>
              <td>{r.customers}</td>
              <td>{usd(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
