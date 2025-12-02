import { generateHabitsCSV, generateExportFilename } from "./exportHabitsCSV";
import { Habit, Habits } from "../../ScrollableHabits/types";

// Helper to create a test habit
const createTestHabit = (id: string, title: string, items: Habit["items"] = [], isDeleted = false): Habit => ({
  id,
  title,
  goal: 5,
  items,
  meta: {
    isDeleted,
    createdOn: "2024-01-01T00:00:00.000Z",
    lastUpdatedOn: "2024-01-01T00:00:00.000Z",
  },
});

// Helper to create a test item
const createTestItem = (
  date: string,
  status: "default" | "done" | "fail" = "default",
  notes = "",
  isDeleted = false,
) => ({
  id: `item-${date}`,
  date: `${date}T00:00:00.000Z`,
  status,
  notes,
  meta: {
    isDeleted,
    createdOn: "2024-01-01T00:00:00.000Z",
    lastUpdatedOn: "2024-01-01T00:00:00.000Z",
  },
});

describe("exportHabitsCSV", () => {
  describe("generateHabitsCSV", () => {
    test("returns message when no habits exist", () => {
      const habits: Habits = {};
      const order: string[] = [];

      const result = generateHabitsCSV(habits, order);

      expect(result).toBe("No habits to export");
    });

    test("returns message when all habits are deleted", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [], true),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);

      expect(result).toBe("No habits to export");
    });

    test("returns message when habits have no items", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", []),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);

      expect(result).toBe("No data to export - start tracking your habits first!");
    });

    test("generates correct CSV header for single habit", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[0]).toBe("Date,Exercise Status,Exercise Note");
    });

    test("generates correct CSV header for multiple habits", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
        habit2: createTestHabit("habit2", "Reading", [createTestItem("2024-01-15", "fail")]),
      };
      const order = ["habit1", "habit2"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[0]).toBe("Date,Exercise Status,Exercise Note,Reading Status,Reading Note");
    });

    test("converts done status to Done", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain("Done");
    });

    test("converts fail status to Fail", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "fail")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain("Fail");
    });

    test("converts default status to empty string", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "default")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      // Should have Date,<empty status>,<empty note>
      expect(lines[1]).toBe("15-01-2024,,");
    });

    test("includes notes in output", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done", "Ran 5 miles")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain("Ran 5 miles");
    });

    test("escapes notes with commas", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done", "Ran, walked, stretched")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain('"Ran, walked, stretched"');
    });

    test("escapes notes with quotes", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done", 'Said "great workout"')]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain('"Said ""great workout"""');
    });

    test("escapes notes with newlines", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done", "Line 1\nLine 2")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      // The escaped value should be wrapped in quotes
      expect(result).toContain('"Line 1\nLine 2"');
    });

    test("formats date as DD-MM-YYYY", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain("15-01-2024");
    });

    test("sorts dates in descending order (newest first)", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [
          createTestItem("2024-01-10", "done"),
          createTestItem("2024-01-15", "done"),
          createTestItem("2024-01-12", "done"),
        ]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[1]).toContain("15-01-2024");
      expect(lines[2]).toContain("12-01-2024");
      expect(lines[3]).toContain("10-01-2024");
    });

    test("respects habit order from order array", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
        habit2: createTestHabit("habit2", "Reading", [createTestItem("2024-01-15", "fail")]),
      };
      // Order is reversed
      const order = ["habit2", "habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      // Reading should come before Exercise in headers
      expect(lines[0]).toBe("Date,Reading Status,Reading Note,Exercise Status,Exercise Note");
    });

    test("excludes deleted items", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [
          createTestItem("2024-01-15", "done", "", false),
          createTestItem("2024-01-16", "done", "", true), // Deleted
        ]),
      };
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      // Should only have header + 1 data row (not the deleted one)
      expect(lines.length).toBe(2);
      expect(lines[1]).toContain("15-01-2024");
    });

    test("handles habits with different dates", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
        habit2: createTestHabit("habit2", "Reading", [createTestItem("2024-01-16", "fail")]),
      };
      const order = ["habit1", "habit2"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      // Should have header + 2 data rows (one for each unique date)
      expect(lines.length).toBe(3);
      // On 16th, Exercise has no data, Reading has Fail
      expect(lines[1]).toBe("16-01-2024,,,Fail,");
      // On 15th, Exercise has Done, Reading has no data
      expect(lines[2]).toBe("15-01-2024,Done,,,");
    });

    test("ignores habits not in order array", () => {
      const habits: Habits = {
        habit1: createTestHabit("habit1", "Exercise", [createTestItem("2024-01-15", "done")]),
        habit2: createTestHabit("habit2", "Reading", [createTestItem("2024-01-15", "fail")]),
      };
      // Only habit1 in order
      const order = ["habit1"];

      const result = generateHabitsCSV(habits, order);
      const lines = result.split("\n");

      expect(lines[0]).toBe("Date,Exercise Status,Exercise Note");
      expect(lines[0]).not.toContain("Reading");
    });
  });

  describe("generateExportFilename", () => {
    test("generates filename with correct prefix", () => {
      const filename = generateExportFilename();

      expect(filename).toMatch(/^inertium_habits_/);
    });

    test("generates filename with .csv extension", () => {
      const filename = generateExportFilename();

      expect(filename).toMatch(/\.csv$/);
    });

    test("generates filename with date-time pattern", () => {
      const filename = generateExportFilename();

      // Pattern: inertium_habits_YYYY-MM-DD_HHMM.csv
      expect(filename).toMatch(/^inertium_habits_\d{4}-\d{2}-\d{2}_\d{4}\.csv$/);
    });
  });
});
