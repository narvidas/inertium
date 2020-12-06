import { Dimensions, StyleSheet } from "react-native";

const boxWH = Dimensions.get("window").width / 8;
export const styles = StyleSheet.create({
  box: {
    width: boxWH,
    height: boxWH,
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
    marginTop: boxWH / 7,
  },
  dayOfWeekWord: {
    textAlign: "center",
    fontSize: boxWH / 4,
    color: "rgba(0,0,0,0.25)",
  },
  dayOfMonthNumber: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: boxWH / 3,
    color: "rgba(0,0,0,0.25)",
  },
  notesDot: {
    color: "rgba(0,0,0,0.25)",
    fontWeight: "bold",
    fontSize: boxWH / 3,
    marginTop: -4,
  },
});
