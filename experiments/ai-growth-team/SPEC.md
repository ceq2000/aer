# Inferred spec: "AI Social Media Team"

Source: a 101 s screen recording (TikTok, @restructureai) that walks through an
architecture diagram and three animated modules. **It is an explainer, not a screen
recording of a shipping app**, so the screens below are the product reconstructed
from the diagrams. Everything here is simulated; there are no real Meta, TikTok,
ElevenLabs, Higgsfield, or Telegram integrations.

## Concept
Claude Code orchestrates a marketing team. Agents write and run work; the human
approves. Tagline: "Claude writes. Jev decides. ElevenLabs talks. You just approve."
No ad or post goes out without sign-off.

## Modules (from the video)
1. **Ads** (Ads Manager → Jev → Claude → Higgsfield → ElevenLabs → You)
   - Weekly budget (shown $500) with a hard "Never spend over $500 / week" lock.
   - Jev scans competitor ads (267 → 412 scanned); ads active longest with real
     spend are the winners (e.g. 72 days / $11,885).
   - Claude writes 20 ads from the winners; Higgsfield makes product video;
     ElevenLabs voices them (deep/calm, warm/slow, bright/fast).
   - Approval card on Telegram ("20 new ads ready"); 48 h live test, then budget
     shifts to winners (#03 $168, #07 $142, #11 $120 of $500).
2. **Leads** (Instagram/Facebook/TikTok → Jev tags → reply + link → lead)
   - Unified inbox of comments and DMs (1,284/day), each tagged fan / buyer / question.
   - Buyer DMs get an instant reply and become leads.
3. **Sales** (new lead → ElevenLabs voice agent → Calendar → You)
   - Voice agent calls within 60 s (shown 0:24 → called back in 0:47 vs "most
     businesses": bought elsewhere), answers, books a listening session.
   - Telegram alert for big deals (e.g. $24,800).
4. **Unified data**: ads.db + comments.db + calls.db → growth.db; a SQL join gives ad
   attribution; Growth dashboard (ad spend $498, 63 buyers, 58 calls, 14 booked,
   $38k–$41k revenue, 95x return).

## Data model
`Ad{id,hook,status pending|live|rejected,spend,leads,calls,revenue}` ·
`CompetitorAd{brand,daysActive,spend}` · `Message{author,channel,kind,text,tag,sourceAd}` ·
`Lead{name,phone,city,sourceAd,status new|calling|booked|paid,dealSize,callSeconds}` ·
`Notification` · `State{weeklyBudget,budgetLocked,...}`.

## Rules enforced in code (`src/store.ts`, tested in `src/store.test.ts`)
- Ads cannot go live until a budget is locked and a human approves.
- Allocated spend never exceeds the locked weekly budget; weighting shifts to
  higher-revenue ads.
- Buyer-intent messages create a lead; a call only books if within 60 s.
- Revenue is attributed to the ad that sourced the lead; deals ≥ $10,000 raise an alert.

## Not reproduced
Real network integrations, media generation, voice, Telegram delivery, and the full
Departments diagram (market intelligence, publishing, reputation, nurture).
