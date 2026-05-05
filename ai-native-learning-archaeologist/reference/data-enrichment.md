# Data Enrichment: External Learning Signals

Learning latency — time between encountering a concept and implementing it — is the most powerful signal. It requires external learning data. The richest source is **Google Takeout**.

## How to Get YouTube Data

Go to [takeout.google.com](https://takeout.google.com). Deselect all, then select only:
- **YouTube and YouTube Music** → watch-history, search-history
- **YouTube and YouTube Music** → subscriptions (optional — shows sustained interest vs. one-off)

Place exported files in a `data/` folder alongside this specialist.

## What It Produces

1. Parse watch history for AI/tech/coding videos with timestamps
2. Extract search terms and topic categories
3. Correlate search/watch dates with commit dates (same day, 1-3 days, 4-7 days)
4. Identify **learning latency** per concept (exposure → first implementation)
5. Map **creator influence** (which YouTubers correlate with which code changes)
6. Detect **learning pipeline direction** (proactive watch→build vs. reactive build→watch)

## Git-Only vs. With Takeout

| Insight | Git-Only | With Takeout |
|---------|----------|-------------|
| Learning latency | Cannot measure | Exact days from exposure to implementation |
| Pipeline direction | Guess from commit types | Prove: watched before or after building? |
| Knowledge sources | Unknown | Which creators, which topics, which order |
| Gap period activity | "No commits" | "35 videos/day — active learning, not dormancy" |
| Learning acceleration | Velocity only | Velocity + latency curve (e.g., 18 days → 1 day) |

## Other Supported Sources

Any timestamped learning events in `date,topic,source` CSV format:
- Udemy/Coursera completion data (export as CSV)
- Kindle reading history (Amazon data export)
- Browser history filtered for documentation sites (Chrome/Firefox export)
