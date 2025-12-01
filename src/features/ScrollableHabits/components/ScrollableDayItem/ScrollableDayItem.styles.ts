import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const AVAILABLE_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;
const DAY_WIDTH = Math.floor(AVAILABLE_WIDTH / 7);

export const styles = StyleSheet.create({
  box: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
    margin: 0,
    backgroundColor: "#dddddd",
  },
  fail: {
    backgroundColor: "#e58570",
    color: "rgba(0,0,0,0.25)",
  },
  done: {
    backgroundColor: "#5A9C5E",
    color: "#fefefe",
  },
  dateContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: DAY_WIDTH / 7,
  },
  dayOfWeekWord: {
    textAlign: "center",
    fontSize: DAY_WIDTH / 4,
    color: "rgba(0,0,0,0.25)",
  },
  dayOfMonthNumber: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: DAY_WIDTH / 3,
    color: "rgba(0,0,0,0.25)",
  },
  notesDot: {
    color: "rgba(0,0,0,0.25)",
    fontWeight: "bold",
    fontSize: DAY_WIDTH / 3,
    textAlign: "center",
    marginTop: -4,
  },
});

export const DAY_ITEM_WIDTH = DAY_WIDTH;
