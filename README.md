# JoTrip Operations Dashboard

Internal operations dashboard for JoTrip at `dash.openphuquoc.com`.

## Architecture lock

- One Operations Center for tour, booking, customer, partner, staff, tasks, alerts and reports.
- Weather & Marine and Airport Live are the only specialist upstream pages.
- Weather and Airport integrations are **read only**. This dashboard does not modify their collectors, parsers, schemas, snapshots or decision logic.
- Current upstream data contracts are read from `kenzuko/Jotrip-Lab` and are isolated in `config.js` so they can track the newest published locks.
- Missing, stale and live states are shown separately. A missing value is never silently converted to zero.

## Current UI status

V1 shell is responsive for desktop and mobile. Internal JoTrip operations data is currently a clearly marked browser-local draft store for workflow/UI validation until the internal persistence layer is connected.
