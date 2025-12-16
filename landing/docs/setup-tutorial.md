# Setting Up an AI Fitness Coach with Claude + Inertium

This guide walks you through creating a personalized AI fitness coach that has direct access to your habit tracking data.

## What You'll Get

- An AI coach in Claude that can query your Inertium data directly
- Weekly check-ins that automatically pull weight, lifts, cardio, and notes
- Progress tracking against custom projections
- Pattern detection and actionable recommendations

## Prerequisites

- [Inertium app](https://inertium.app) with habits set up
- [Claude Pro subscription](https://claude.ai) (required for Projects)
- Inertium MCP server configured (see [MCP Setup Guide](#mcp-setup))

---

## Step 1: Create a Claude Project

1. Open [claude.ai](https://claude.ai)
2. Click **Projects** in the sidebar
3. Click **New Project**
4. Name it something like "Fitness Coach" or "Recomp Program"

---

## Step 2: Set Up Project Instructions

In your project's **Instructions** field, paste:

```
# Role
You are a fitness and nutrition advisor tracking a [PROGRAM LENGTH] [PROGRAM TYPE] program. Reference the attached plan document for protocols, projections, and historical data.

# Subject Summary
[Your stats: age, height, weight, training history]
[Your goals and timeline]

# Current Phase
[Phase name and targets]
- Target: [start weight] → [end weight]
- Calories: [daily target]
- Protein: [daily target] (non-negotiable during cut)
- Training: [program and frequency]
- Rate: [target weekly change]

# Key Rules
- Protein first — every nutrition adjustment must preserve protein target
- Track actuals vs projections — flag deviations >10%
- Recovery awareness — watch for fatigue signals; suggest deloads proactively
- Data-driven — only comment on progress if actual numbers are available

# When User Reports Progress
- Compare to projection table in attached files
- Note if ahead/behind on targets
- Suggest protocol adjustments if off-target for 2+ weeks
- Keep responses concise; tables/bullets only when data-heavy

# Communication Style
Direct, data-driven, no fluff. Challenge assumptions if the math doesn't add up. Prioritize actionable recommendations.

If you don't have access to specific data, explicitly state "I don't have that data" rather than speculating.
```

Customize the bracketed sections for your specific program.

---

## Step 3: Add Your Planning Documents

Upload these files to your project's **Knowledge** section:

### Required: Main Plan Document

Create a markdown file with:
- Your baseline stats and training history
- Program phases with dates
- Nutrition protocols (calories, macros, meal structure)
- Training protocols
- Projection tables (weight and strength targets by week)
- Progress log table

Example structure:
```markdown
# Body Recomposition Plan

## Subject Profile
- Demographics: [age, height, starting weight]
- Training history: [relevant background]
- TDEE estimate: [calories]

## Program Goals
- Phase 1: [description, timeline]
- Phase 2: [description, timeline]

## Phase 1 Protocol
[Nutrition targets table]
[Training protocol]
[Weekly tracking rules]

## Projection Model
[Projected milestones table with dates, weights, lift targets]

## Progress Log
| Date | Week | Weight | Squat | Bench | Dead | Notes |
|------|------|--------|-------|-------|------|-------|
| [start date] | 0 | [weight] | [lifts] | | | Program start |
```

### Recommended: Weekly Check-in Template

A structured format for consistent check-ins:
```markdown
# Weekly Check-in Template

## Session Flow
1. Data pull (weight, lifts, cardio, notes from Inertium)
2. Subjective questions (energy, sleep, pain, hunger)
3. Analysis (weight trend, strength progression, adherence)
4. Flags and recommendations

## Output Format
- Weight vs target
- Lifts vs projection
- Adherence rates
- Flags (concerns or notable patterns)
- Recommendations
- Next check-in date and targets
```

### Optional: Supporting Documents

- Phase-specific protocols
- Weekly weight targets with tolerance bands
- Equipment/gear tracking
- Injury notes or limitations

---

## Step 4: Set Up Inertium Habits

Create habits in Inertium that match your program:

**For strength training:**
- "Powerlifting" or "Lifting" — log working weights in notes
- Format notes consistently: `S/B/D/O/R = 80/62.5/90/45/50`

**For weight tracking:**
- "Weight" — daily entries with kg/lbs in notes
- Morning weigh-ins for consistency

**For cardio:**
- "Cardio" or "Running" — duration, distance, HR in notes

**For accessories:**
- "Pullups", "Ab Ripper", "Stretching" — whatever you track

**Tip:** Consistent note formatting helps Claude parse your data accurately.

---

## Step 5: Connect MCP

[See MCP Setup Guide for technical integration steps]

Once connected, Claude can call:
- `list_habits` — see all your tracked habits
- `get_habit_entries` — pull entries for a date range
- `get_weekly_summary` — completion stats grouped by week
- `search_notes` — find specific mentions (injuries, PRs, issues)
- `get_habit_stats` — streaks and overall completion rates

---

## Using Your AI Coach

### Weekly Check-ins

Start a conversation in your project:
> "Weekly check-in"

Claude will pull your data from Inertium and generate a structured analysis.

### Ad-hoc Questions

> "How are my lifts tracking vs projection?"

> "Search my notes for knee pain mentions"

> "What was my weight trend last 2 weeks?"

### Program Adjustments

> "I've been losing weight too fast—should I adjust calories?"

> "My OHP has stalled for 3 sessions, what should I do?"

---

## Example Check-in Output

```
## Week 4 Summary — Dec 13, 2025

**Weight:** 87.0 kg (target: 87.4 kg) → 0.4kg ahead
**Rate:** 0.93 kg/week (target: 0.5-0.7) ⚠️ slightly fast

**Lifts vs Projection:**
| Lift | Actual | Projected | Status |
|------|--------|-----------|--------|
| Squat | 80 kg | 70 kg | ✓ +10kg ahead |
| Bench | 62.5 kg | 57.5 kg | ✓ +5kg ahead |

**Flags:**
- ⚠️ Knee clicks persistent but stable
- ℹ️ Weight loss rate elevated—monitor next week

**Recommendations:**
1. Continue current protocol—no changes needed
2. Resume daily weigh-ins post-vacation
3. If >0.8 kg/week continues, bump to 2400 kcal
```

---

## Tips for Best Results

1. **Log consistently** — More data = better analysis
2. **Use structured notes** — Consistent formatting helps parsing
3. **Include context** — Note sleep, stress, diet deviations
4. **Update projections** — Refresh your plan doc as you progress
5. **Be specific in questions** — "How's my squat progressing?" > "How am I doing?"

---

## Troubleshooting

**Claude says "I don't have that data"**
- Check MCP connection is active
- Verify habit names match what you're asking about
- Ensure entries exist for the date range

**Analysis seems off**
- Review note formatting—inconsistent formats confuse parsing
- Check if you're in the right project
- Update plan document if program has changed

**Want to change programs**
- Update the plan document and instructions
- Keep old progress log for reference
- Adjust projection tables for new phase
