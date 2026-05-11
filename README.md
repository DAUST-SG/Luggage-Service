# Luggage Dispatch — DAUST Student Government

A 2-page system for collecting student luggage pickup locations and clustering them into delivery trucks. Designed for end-of-semester moveout — students register their bags, fridges, monitors, etc. and a truck drops everything at relay points near groups of students.

- **`shuttle-signup.html`** — public form (French). Each student drops a pin, enters their info, and selects luggage quantities across 7 categories (small/medium/large bags, monitors, small/medium fridges, other).
- **`shuttle-dispatch.html`** — admin dashboard (English). Loads signups, runs k-means clustering, shows the map + per-truck luggage breakdown, exports CSV.
- **`convex/schema.addition.ts`** — the new table to add to your existing schema.
- **`convex/shuttleSignups.ts`** — Convex functions (create/list/remove).

Backend: `decisive-whale-691.convex.cloud` (your existing deployment).

---

## 1. Convex setup

In your existing Convex project:

**a.** Open `convex/schema.ts` and add the `shuttleSignups` table from `convex/schema.addition.ts` *inside* your existing `defineSchema({ ... })` block. Do not replace the file — just merge the new table alongside `projects`, `tasks`, etc.

**b.** Copy `convex/shuttleSignups.ts` into your `convex/` folder.

**c.** Run:
```bash
npx convex dev
```
This deploys the schema + functions. You should see `shuttleSignups:create`, `shuttleSignups:list`, `shuttleSignups:remove`, `shuttleSignups:clearEvent` in your dashboard.

**d.** Quick smoke test:
```bash
curl -X POST https://decisive-whale-691.convex.cloud/api/mutation \
  -H "Content-Type: application/json" \
  -d '{"path":"shuttleSignups:create","args":{"name":"Test","phone":"771234567","lat":14.74,"lng":-17.15,"luggage":{"smallBags":1,"mediumBags":2,"largeBags":0,"monitors":1,"smallFridges":0,"mediumFridges":0,"other":0},"eventLabel":"daust-impact-2026"},"format":"json"}'
```
Expect `{"status":"success","value":{"id":"...","updated":false}}`.

---

## 2. Deploy the signup form

The signup form must be hosted on **HTTPS** for the geolocation button to work in browsers. Easiest options:

- **Netlify Drop** — drag `shuttle-signup.html` onto https://app.netlify.com/drop, get a public URL in ~10 seconds.
- **Vercel** — `vercel deploy` from a folder containing the file.
- **GitHub Pages** — push to a repo, enable Pages.

Share that URL by WhatsApp to your student list.

If you want a custom domain (e.g. `bagages.daustsg.com`), point a CNAME at whichever host you pick.

---

## 3. Run the dispatch dashboard

Open `shuttle-dispatch.html` directly in your browser — it works as a local file. Or host it privately (it has no auth, so don't put it on a public URL).

It auto-refreshes every 30 seconds.

---

## 4. Configure per event

Both HTML files have a `CONFIG` block at the top of their `<script>`. Change `EVENT_LABEL` to a new string for each event (e.g. `graduation-2026`, `freshers-week-2026`) — the dispatch page will only show signups for the matching label, so multiple events can coexist in the same table.

```js
const CONVEX_URL = 'https://decisive-whale-691.convex.cloud';
const EVENT_LABEL = 'daust-impact-2026';
```

---

## 5. How the clustering works

- **Algorithm**: k-means++ initialization + Haversine distance (real-world km on the sphere, accurate for Dakar–Thiès) + capacity rebalancing.
- **Slider** sets the number of trucks (2–12).
- **Capacity** is measured in **liters of cargo** per truck. Each luggage category has a volume estimate defined at the top of the dispatch script (`VOLUME_LITERS`), so they're easy to recalibrate:

| Category | Volume (L) |
|---|---|
| Small bag | 25 |
| Medium bag | 55 |
| Large bag | 90 |
| Monitor | 40 |
| Small fridge | 80 |
| Medium fridge | 200 |
| Other | 35 |

- If a cluster's total volume exceeds the max, the farthest member from that truck's centroid is moved to the nearest under-capacity truck. Repeats until all trucks fit or no room remains.
- **Relay point** = centroid of the cluster, reverse-geocoded via Nominatim (free OSM service) into a neighborhood name. Throttled to 1/sec to respect the service's usage policy.

---

## 6. Cleanup between events

To wipe signups for an event without dropping the table:

```bash
curl -X POST https://decisive-whale-691.convex.cloud/api/mutation \
  -H "Content-Type: application/json" \
  -d '{"path":"shuttleSignups:clearEvent","args":{"eventLabel":"daust-impact-2026"},"format":"json"}'
```

---

## Notes

- The signup form's `create` mutation upserts by phone — re-submissions update the existing row, so students can fix their pin or luggage without creating duplicates.
- The dispatch page uses CARTO's dark tiles; the signup page uses standard OSM tiles (lighter, friendlier for the public form).
- No auth is enforced on the Convex functions. If you want to lock the `list` query, add an auth check inside the handler.
- Existing signups without `luggage` data still load — the dispatch treats missing luggage as all-zeros.
