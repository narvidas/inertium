#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase, Database } from "firebase-admin/database";
import { startOfWeek, endOfWeek, subWeeks, parseISO, format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Get directory of current module
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// =============================================================================
// Types
// =============================================================================

interface Meta {
  isDeleted?: boolean;
  createdOn: string;
  lastUpdatedOn: string;
}

interface Item {
  id: string;
  date: string;
  status: "default" | "done" | "fail";
  notes?: string;
  meta: Meta;
}

interface Habit {
  id: string;
  title: string;
  goal: number;
  items: Item[];
  meta: Meta;
}

interface HabitOrder {
  order: string[];
  meta: Meta;
}

interface Config {
  userId: string;
  serviceAccountPath: string;
  databaseURL: string;
}

// =============================================================================
// Configuration & Firebase Setup
// =============================================================================

function loadConfig(): Config {
  const configPath = join(PROJECT_ROOT, "config.json");
  if (!existsSync(configPath)) {
    throw new Error(
      `Config file not found at ${configPath}. Please create config.json with userId and serviceAccountPath.`,
    );
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

function initializeFirebase(config: Config): Database {
  const serviceAccountPath = join(PROJECT_ROOT, config.serviceAccountPath);
  if (!existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at ${serviceAccountPath}. Please download from Firebase console.`);
  }

  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: config.databaseURL,
    });
  }

  return getDatabase();
}

// =============================================================================
// Data Access Layer
// =============================================================================

async function getAllHabits(db: Database, userId: string): Promise<Habit[]> {
  const snapshot = await db.ref(`habits/${userId}`).once("value");
  const habitsObj = snapshot.val();
  if (!habitsObj) return [];
  return Object.values(habitsObj as Record<string, Habit>).filter((h) => !h.meta?.isDeleted);
}

async function getHabitOrder(db: Database, userId: string): Promise<string[]> {
  const snapshot = await db.ref(`metadata/${userId}/habitOrder`).once("value");
  const orderData = snapshot.val() as HabitOrder | null;
  return orderData?.order || [];
}

async function getHabitByTitle(db: Database, userId: string, title: string): Promise<Habit | null> {
  const habits = await getAllHabits(db, userId);
  return habits.find((h) => h.title.toLowerCase() === title.toLowerCase()) || null;
}

async function getHabitById(db: Database, userId: string, habitId: string): Promise<Habit | null> {
  const snapshot = await db.ref(`habits/${userId}/${habitId}`).once("value");
  const habit = snapshot.val() as Habit | null;
  if (habit && !habit.meta?.isDeleted) {
    return habit;
  }
  return null;
}

// =============================================================================
// Analysis Functions
// =============================================================================

interface DateRange {
  start: Date;
  end: Date;
}

function getItemsInRange(items: Item[], range: DateRange): Item[] {
  return items.filter((item) => {
    const itemDate = parseISO(item.date);
    return isWithinInterval(itemDate, { start: range.start, end: range.end });
  });
}

function calculateStreak(items: Item[], status: "done" | "fail"): number {
  const sorted = [...items].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  let streak = 0;
  for (const item of sorted) {
    if (item.status === status) {
      streak++;
    } else if (item.status !== "default") {
      break;
    }
  }
  return streak;
}

function getWeeklySummary(items: Item[], numWeeks: number): object[] {
  const summaries = [];
  const today = new Date();

  for (let i = 0; i < numWeeks; i++) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekItems = getItemsInRange(items, { start: weekStart, end: weekEnd });

    const daysTracked = weekItems.filter((i) => i.status !== "default").length;
    const daysCompleted = weekItems.filter((i) => i.status === "done").length;
    const daysFailed = weekItems.filter((i) => i.status === "fail").length;

    // Include all entries with their raw notes for Claude to parse
    const entries = weekItems
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map((item) => ({
        date: format(parseISO(item.date), "yyyy-MM-dd (EEE)"),
        status: item.status,
        notes: item.notes || null,
      }));

    summaries.push({
      weekOf: format(weekStart, "yyyy-MM-dd"),
      weekLabel: `Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
      daysTracked,
      daysCompleted,
      daysFailed,
      completionRate: daysTracked > 0 ? Math.round((daysCompleted / daysTracked) * 100) : 0,
      entries,
    });
  }

  return summaries;
}

// =============================================================================
// MCP Server Setup
// =============================================================================

const config = loadConfig();
const db = initializeFirebase(config);

const server = new Server(
  { name: "inertium-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } },
);

// =============================================================================
// Tool Definitions
// =============================================================================

const tools = [
  {
    name: "list_habits",
    description:
      "List all habits with their IDs, titles, goals, and entry counts. Use this first to discover available habits.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_habit_entries",
    description:
      "Get daily entries for a habit within a date range. Returns status (done/fail/default) and raw notes for each day. Notes are free-text and may contain workout details, metrics, or observations that you should parse contextually.",
    inputSchema: {
      type: "object" as const,
      properties: {
        habit: { type: "string", description: "Habit title or ID" },
        startDate: { type: "string", description: "Start date (YYYY-MM-DD). Defaults to 4 weeks ago." },
        endDate: { type: "string", description: "End date (YYYY-MM-DD). Defaults to today." },
      },
      required: ["habit"],
    },
  },
  {
    name: "get_weekly_summary",
    description:
      "Get weekly summaries for a habit. Shows completion stats and all entries with raw notes grouped by week. Best for trend analysis over multiple weeks. Notes contain free-text data (workout logs, metrics, observations) that you should interpret.",
    inputSchema: {
      type: "object" as const,
      properties: {
        habit: { type: "string", description: "Habit title or ID" },
        weeks: { type: "number", description: "Number of weeks to include (default: 4)" },
      },
      required: ["habit"],
    },
  },
  {
    name: "search_notes",
    description:
      "Search habit notes for keywords. Useful for finding specific mentions like injuries, deloads, PRs, or any topic across entries.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search term (case-insensitive)" },
        habit: { type: "string", description: "Optional: limit to specific habit" },
        startDate: { type: "string", description: "Optional: start date (YYYY-MM-DD)" },
        endDate: { type: "string", description: "Optional: end date (YYYY-MM-DD)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_trends",
    description: "Compare habit completion rates between two time periods. Shows improvement/decline statistics.",
    inputSchema: {
      type: "object" as const,
      properties: {
        habit: { type: "string", description: "Habit title or ID" },
        period1Start: { type: "string", description: "First period start (YYYY-MM-DD)" },
        period1End: { type: "string", description: "First period end (YYYY-MM-DD)" },
        period2Start: {
          type: "string",
          description: "Second period start. Defaults to equivalent period ending today.",
        },
        period2End: { type: "string", description: "Second period end. Defaults to today." },
      },
      required: ["habit", "period1Start", "period1End"],
    },
  },
  {
    name: "get_habit_stats",
    description: "Get overall statistics: current streak, longest streak, total completions, all-time completion rate.",
    inputSchema: {
      type: "object" as const,
      properties: {
        habit: { type: "string", description: "Habit title or ID" },
      },
      required: ["habit"],
    },
  },
];

// =============================================================================
// Tool Handlers
// =============================================================================

async function handleListHabits(): Promise<object> {
  const habits = await getAllHabits(db, config.userId);
  const order = await getHabitOrder(db, config.userId);

  const sortedHabits = order.length
    ? order
        .map((id) => habits.find((h) => h.id === id))
        .filter(Boolean)
        .concat(habits.filter((h) => !order.includes(h.id)))
    : habits;

  return {
    count: sortedHabits.length,
    habits: sortedHabits.map((h) => ({
      id: h!.id,
      title: h!.title,
      goal: h!.goal,
      itemCount: h!.items?.length || 0,
      createdOn: h!.meta.createdOn,
    })),
  };
}

async function handleGetHabitEntries(args: { habit: string; startDate?: string; endDate?: string }): Promise<object> {
  let habit = await getHabitByTitle(db, config.userId, args.habit);
  if (!habit) habit = await getHabitById(db, config.userId, args.habit);
  if (!habit) return { error: `Habit not found: ${args.habit}` };

  const endDate = args.endDate ? parseISO(args.endDate) : new Date();
  const startDate = args.startDate ? parseISO(args.startDate) : subWeeks(endDate, 4);
  const items = habit.items || [];
  const filtered = getItemsInRange(items, { start: startOfDay(startDate), end: endOfDay(endDate) });
  const sorted = filtered.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return {
    habit: habit.title,
    habitId: habit.id,
    goal: habit.goal,
    dateRange: { start: format(startDate, "yyyy-MM-dd"), end: format(endDate, "yyyy-MM-dd") },
    totalEntries: sorted.length,
    entries: sorted.map((item) => ({
      date: format(parseISO(item.date), "yyyy-MM-dd"),
      dayOfWeek: format(parseISO(item.date), "EEEE"),
      status: item.status,
      notes: item.notes || null,
    })),
  };
}

async function handleGetWeeklySummary(args: { habit: string; weeks?: number }): Promise<object> {
  let habit = await getHabitByTitle(db, config.userId, args.habit);
  if (!habit) habit = await getHabitById(db, config.userId, args.habit);
  if (!habit) return { error: `Habit not found: ${args.habit}` };

  return {
    habit: habit.title,
    habitId: habit.id,
    goal: habit.goal,
    weeksAnalyzed: args.weeks || 4,
    summaries: getWeeklySummary(habit.items || [], args.weeks || 4),
  };
}

async function handleSearchNotes(args: {
  query: string;
  habit?: string;
  startDate?: string;
  endDate?: string;
}): Promise<object> {
  let habitsToSearch: Habit[] = [];

  if (args.habit) {
    let habit = await getHabitByTitle(db, config.userId, args.habit);
    if (!habit) habit = await getHabitById(db, config.userId, args.habit);
    if (!habit) return { error: `Habit not found: ${args.habit}` };
    habitsToSearch = [habit];
  } else {
    habitsToSearch = await getAllHabits(db, config.userId);
  }

  const results: object[] = [];
  const query = args.query.toLowerCase();

  for (const habit of habitsToSearch) {
    let items = habit.items || [];

    if (args.startDate || args.endDate) {
      const startDate = args.startDate ? parseISO(args.startDate) : new Date(0);
      const endDate = args.endDate ? parseISO(args.endDate) : new Date();
      items = getItemsInRange(items, { start: startOfDay(startDate), end: endOfDay(endDate) });
    }

    for (const item of items) {
      if (item.notes && item.notes.toLowerCase().includes(query)) {
        results.push({
          habit: habit.title,
          habitId: habit.id,
          date: format(parseISO(item.date), "yyyy-MM-dd"),
          dayOfWeek: format(parseISO(item.date), "EEEE"),
          status: item.status,
          notes: item.notes,
        });
      }
    }
  }

  results.sort((a: any, b: any) => b.date.localeCompare(a.date));

  return { query: args.query, totalMatches: results.length, results };
}

async function handleGetTrends(args: {
  habit: string;
  period1Start: string;
  period1End: string;
  period2Start?: string;
  period2End?: string;
}): Promise<object> {
  let habit = await getHabitByTitle(db, config.userId, args.habit);
  if (!habit) habit = await getHabitById(db, config.userId, args.habit);
  if (!habit) return { error: `Habit not found: ${args.habit}` };

  const items = habit.items || [];
  const p1Start = parseISO(args.period1Start);
  const p1End = parseISO(args.period1End);
  const p1Items = getItemsInRange(items, { start: startOfDay(p1Start), end: endOfDay(p1End) });

  const p1Duration = p1End.getTime() - p1Start.getTime();
  const p2End = args.period2End ? parseISO(args.period2End) : new Date();
  const p2Start = args.period2Start ? parseISO(args.period2Start) : new Date(p2End.getTime() - p1Duration);
  const p2Items = getItemsInRange(items, { start: startOfDay(p2Start), end: endOfDay(p2End) });

  const p1Completed = p1Items.filter((i) => i.status === "done").length;
  const p1Tracked = p1Items.filter((i) => i.status !== "default").length;
  const p2Completed = p2Items.filter((i) => i.status === "done").length;
  const p2Tracked = p2Items.filter((i) => i.status !== "default").length;
  const p1Rate = p1Tracked > 0 ? (p1Completed / p1Tracked) * 100 : 0;
  const p2Rate = p2Tracked > 0 ? (p2Completed / p2Tracked) * 100 : 0;

  return {
    habit: habit.title,
    habitId: habit.id,
    goal: habit.goal,
    period1: {
      start: format(p1Start, "yyyy-MM-dd"),
      end: format(p1End, "yyyy-MM-dd"),
      daysTracked: p1Tracked,
      daysCompleted: p1Completed,
      completionRate: Math.round(p1Rate),
    },
    period2: {
      start: format(p2Start, "yyyy-MM-dd"),
      end: format(p2End, "yyyy-MM-dd"),
      daysTracked: p2Tracked,
      daysCompleted: p2Completed,
      completionRate: Math.round(p2Rate),
    },
    comparison: {
      completionRateChange: Math.round(p2Rate - p1Rate),
      trackedDaysChange: p2Tracked - p1Tracked,
      completedDaysChange: p2Completed - p1Completed,
      trend: p2Rate > p1Rate ? "improving" : p2Rate < p1Rate ? "declining" : "stable",
    },
  };
}

async function handleGetHabitStats(args: { habit: string }): Promise<object> {
  let habit = await getHabitByTitle(db, config.userId, args.habit);
  if (!habit) habit = await getHabitById(db, config.userId, args.habit);
  if (!habit) return { error: `Habit not found: ${args.habit}` };

  const items = habit.items || [];
  const sorted = [...items].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const totalTracked = items.filter((i) => i.status !== "default").length;
  const totalCompleted = items.filter((i) => i.status === "done").length;
  const totalFailed = items.filter((i) => i.status === "fail").length;
  const currentStreak = calculateStreak(sorted, "done");

  let longestStreak = 0,
    currentRun = 0;
  for (const item of sorted) {
    if (item.status === "done") {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else if (item.status === "fail") {
      currentRun = 0;
    }
  }

  const firstEntry = sorted.length > 0 ? sorted[0] : null;
  const lastEntry = sorted.length > 0 ? sorted[sorted.length - 1] : null;

  return {
    habit: habit.title,
    habitId: habit.id,
    goal: habit.goal,
    createdOn: habit.meta.createdOn,
    stats: {
      totalEntries: items.length,
      totalTracked,
      totalCompleted,
      totalFailed,
      allTimeCompletionRate: totalTracked > 0 ? Math.round((totalCompleted / totalTracked) * 100) : 0,
      currentStreak,
      longestStreak,
      firstEntryDate: firstEntry ? format(parseISO(firstEntry.date), "yyyy-MM-dd") : null,
      lastEntryDate: lastEntry ? format(parseISO(lastEntry.date), "yyyy-MM-dd") : null,
    },
  };
}

// =============================================================================
// Request Handlers
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: object;
    switch (name) {
      case "list_habits":
        result = await handleListHabits();
        break;
      case "get_habit_entries":
        result = await handleGetHabitEntries(args as any);
        break;
      case "get_weekly_summary":
        result = await handleGetWeeklySummary(args as any);
        break;
      case "search_notes":
        result = await handleSearchNotes(args as any);
        break;
      case "get_trends":
        result = await handleGetTrends(args as any);
        break;
      case "get_habit_stats":
        result = await handleGetHabitStats(args as any);
        break;
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
      isError: true,
    };
  }
});

// =============================================================================
// Resources
// =============================================================================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const habits = await getAllHabits(db, config.userId);
  return {
    resources: habits.map((h) => ({
      uri: `inertium://habit/${h.id}`,
      name: h.title,
      description: `Habit: ${h.title} (Goal: ${h.goal} days/week)`,
      mimeType: "application/json",
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const match = request.params.uri.match(/^inertium:\/\/habit\/(.+)$/);
  if (!match) throw new Error(`Invalid resource URI: ${request.params.uri}`);

  const habit = await getHabitById(db, config.userId, match[1]);
  if (!habit) throw new Error(`Habit not found: ${match[1]}`);

  const result = await handleGetWeeklySummary({ habit: match[1], weeks: 4 });
  return {
    contents: [{ uri: request.params.uri, mimeType: "application/json", text: JSON.stringify(result, null, 2) }],
  };
});

// =============================================================================
// Main
// =============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Inertium MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
