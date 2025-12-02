import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import { Habit, Habits, Status } from "../../ScrollableHabits/types";

/**
 * Converts habit status to CSV-friendly format
 */
const statusToCSV = (status: Status | undefined): string => {
  if (status === "done") return "Done";
  if (status === "fail") return "Fail";
  return "";
};

/**
 * Escapes CSV field values (handles commas, quotes, newlines)
 */
const escapeCSVField = (value: string): string => {
  if (!value) return "";
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Generates CSV content from habits data
 *
 * Format:
 * Date,Habit1 Status,Habit1 Note,Habit2 Status,Habit2 Note,...
 * DD-MM-YYYY,Pass/Fail/,notes content,...
 */
export const generateHabitsCSV = (habits: Habits, order: string[]): string => {
  // Filter out deleted habits and sort by order
  const activeHabits = order
    .map((id) => habits[id])
    .filter((habit): habit is Habit => !!habit && !habit.meta?.isDeleted);

  if (activeHabits.length === 0) {
    return "No habits to export";
  }

  // Collect all unique dates from all habits
  const allDates = new Set<string>();
  activeHabits.forEach((habit) => {
    habit.items.forEach((item) => {
      if (!item.meta?.isDeleted) {
        // Extract just the date part (YYYY-MM-DD)
        const dateStr = item.date.split("T")[0];
        allDates.add(dateStr);
      }
    });
  });

  // Sort dates in descending order (newest first)
  const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return "No data to export - start tracking your habits first!";
  }

  // Build header row
  const headers = ["Date"];
  activeHabits.forEach((habit) => {
    headers.push(`${habit.title} Status`);
    headers.push(`${habit.title} Note`);
  });

  // Build data rows
  const rows: string[][] = [headers];

  sortedDates.forEach((dateStr) => {
    const row: string[] = [];

    // Format date as DD-MM-YYYY
    const date = parseISO(dateStr);
    row.push(format(date, "dd-MM-yyyy"));

    // Add status and notes for each habit
    activeHabits.forEach((habit) => {
      const item = habit.items.find((i) => !i.meta?.isDeleted && i.date.startsWith(dateStr));

      row.push(statusToCSV(item?.status));
      row.push(escapeCSVField(item?.notes || ""));
    });

    rows.push(row);
  });

  // Convert to CSV string
  return rows.map((row) => row.join(",")).join("\n");
};

/**
 * Generates a filename for the CSV export
 */
export const generateExportFilename = (): string => {
  const timestamp = format(new Date(), "yyyy-MM-dd_HHmm");
  return `inertium_habits_${timestamp}.csv`;
};
