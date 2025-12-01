import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Main container
  calendarContainer: {
    overflow: "hidden",
  },
  innerContainer: {
    flex: 1,
  },
  datesStrip: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  calendarDates: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // Header
  calendarHeader: {
    textAlign: "center",
    fontWeight: "bold",
    alignSelf: "center",
  },

  // Week selector
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  icon: {
    resizeMode: "contain",
  },

  // Calendar day
  dateContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  dateName: {
    textAlign: "center",
  },
  dateNumber: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

