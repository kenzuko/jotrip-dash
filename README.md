# JoTrip Operations Dashboard

Internal operations dashboard for JoTrip at `dash.openphuquoc.com`.

## Review V4

Deep UI/UX review workspace: `https://dash.openphuquoc.com/review.html`

- 24 screens covering command center, tour/booking, customer, partner, resource planning, roster, shift handover, live intelligence, data health, reports, RBAC, settings and mobile field mode.
- Includes Desktop / Tablet / Mobile preview controls and per-screen review notes.
- Review V4 is isolated from the production shell so the approved structure can be merged cleanly instead of patching the main app repeatedly.

See `REVIEW_V4.md` for the morning review checklist.

## Architecture lock

- One Operations Center for tour, booking, customer, partner, staff, tasks, alerts and reports.
- Weather & Marine and Airport Live are the only specialist upstream pages.
- Weather and Airport integrations are **read only**. This dashboard does not modify their collectors, parsers, schemas, snapshots or decision logic.
- Current upstream data contracts are read from `kenzuko/Jotrip-Lab` and are isolated in `config.js` so they can track the newest published locks.
- Missing, stale and live states are shown separately. A missing value is never silently converted to zero.

## Current UI status

The production shell is responsive for desktop and mobile. Internal JoTrip operations data is currently a clearly marked browser-local draft store for workflow/UI validation until the internal persistence layer is connected. Authentication/RBAC UX is present; production enforcement remains dependent on Supabase Auth + RLS setup.
