# Inertium MCP Server

An MCP (Model Context Protocol) server that exposes habit tracking data from the Inertium iOS app to Claude Desktop for AI-powered fitness coaching and trend analysis.

## Philosophy

This server returns **raw data** and lets Claude do the interpretation. Notes are free-text and may contain workout logs, metrics, observations — Claude is much better at parsing natural language variations than brittle regex patterns.

## Features

- **List Habits**: Discover all tracked habits with metadata
- **Get Entries**: Fetch daily entries with status and raw notes
- **Weekly Summaries**: Completion rates and entries grouped by week
- **Search Notes**: Full-text search across all habit notes
- **Trend Analysis**: Compare performance across time periods
- **Habit Stats**: Streaks, completion rates, and historical data

## Prerequisites

- Node.js 18+ 
- Firebase project with Realtime Database
- Firebase Admin SDK service account credentials

## Setup

### 1. Install dependencies

```bash
cd mcp/inertium-mcp-server
yarn install
```

### 2. Configure Firebase credentials

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Project Settings → Service Accounts
2. Click "Generate new private key" and download the JSON file
3. Save it as `service-account.json` in this directory

### 3. Create config.json

```bash
cp config.example.json config.json
```

Edit `config.json`:

```json
{
  "userId": "YOUR_FIREBASE_USER_ID",
  "serviceAccountPath": "service-account.json"
}
```

**Finding your userId**: 
- In Firebase Console → Authentication → Users, find your account and copy the UID
- Or check the Realtime Database under `habits/` — your UID is the first key

### 4. Build the server

```bash
yarn build
```

### 5. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "inertium": {
      "command": "node",
      "args": ["/path/to/inertium/mcp/inertium-mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/path/to/inertium` with your actual project path.

### 6. Restart Claude Desktop

Quit and reopen Claude Desktop. You should see "inertium" in the MCP servers list.

## Usage Examples

Once connected, ask Claude things like:

### Discovering habits
> "What habits am I tracking in Inertium?"

### Weekly check-in
> "Give me a weekly summary of my Lifts habit for the last 4 weeks"

### Analyzing workout notes
> "Look at my Lifts entries from the past month and tell me how my squat progression is going"

### Finding issues
> "Search my notes for 'pain' or 'injury' across all habits"

### Trend analysis
> "Compare my Cardio completion rate this month vs last month"

### Stats
> "What's my current streak and all-time stats for Wake-up early?"

## Available Tools

| Tool | Description |
|------|-------------|
| `list_habits` | List all habits with IDs, titles, goals |
| `get_habit_entries` | Daily entries with status and raw notes |
| `get_weekly_summary` | Weekly completion stats with all entries |
| `search_notes` | Search text across habit notes |
| `get_trends` | Compare two time periods |
| `get_habit_stats` | Streaks, completion rates, totals |

## How Notes Work

Notes are returned as raw text. Claude interprets them contextually. For example:

**Lifts notes** might look like:
```
Day A
Squat 185
Bench 135
Row 115
```

**Cardio notes** might look like:
```
5k in 28min, felt good
```

**Diet notes** might look like:
```
~1800 cal, high protein day
```

Claude will parse and extract meaning from these during conversation.

## Development

```bash
# Run in development mode
yarn dev

# Build for production
yarn build

# Run production build
yarn start
```

## Troubleshooting

### "Config file not found"
Create `config.json` from `config.example.json`

### "Service account file not found"
Download service account JSON from Firebase Console

### "Permission denied" from Firebase
- Ensure service account has Realtime Database access
- Check database rules allow admin SDK access

### Server not appearing in Claude
- Check `claude_desktop_config.json` path is correct
- Ensure the server builds without errors
- Check Claude Desktop logs for connection errors
