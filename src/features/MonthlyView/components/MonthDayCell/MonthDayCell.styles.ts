import { StyleSheet } from "react-native";

// Cell takes up 1/7 of width (7 days per week)
// We use percentages and aspectRatio for responsive sizing
export const styles = StyleSheet.create({
  cellContainer: {
    width: "14.28%", // 100% / 7 days
    aspectRatio: 1,
    padding: 2,
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999, // Round cells
    backgroundColor: "#f5f5f5",
  },
  cellEmpty: {
    backgroundColor: "transparent",
  },
  cellDefault: {
    backgroundColor: "#e8e8e8", // Lighter gray
  },
  cellDone: {
    backgroundColor: "#5A9C5E",
  },
  cellFail: {
    backgroundColor: "#e58570",
  },
  cellToday: {
    borderWidth: 1, // Thinner border
    borderColor: "#333",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  dayNumberDone: {
    color: "#fff",
  },
  dayNumberFail: {
    color: "#fff",
  },
  dayNumberOutside: {
    color: "#bbb",
  },
  dateContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  notesDot: {
    fontSize: 24, // Bigger dot
    fontWeight: "bold",
    color: "#666",
    lineHeight: 14, // Compact line height to position closer to number
    marginTop: -4,
  },
  notesDotDone: {
    color: "#fff",
  },
  notesDotFail: {
    color: "#fff",
  },
});
