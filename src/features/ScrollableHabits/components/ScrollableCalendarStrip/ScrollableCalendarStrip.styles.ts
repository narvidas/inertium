import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const AVAILABLE_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;
const DAY_WIDTH = Math.floor(AVAILABLE_WIDTH / 7);

export const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  thisWeekButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#5A9C5E",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  thisWeekButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  daysContainer: {
    height: DAY_WIDTH + 10,
  },
  dayContainer: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: DAY_WIDTH / 2,
  },
  dayContainerToday: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.8)",
  },
  dayContainerFaded: {
    opacity: 0.8,
  },
  dateName: {
    fontSize: DAY_WIDTH / 5,
    color: "#666",
    textAlign: "center",
  },
  dateNumber: {
    fontSize: DAY_WIDTH / 2.9,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  dateNumberToday: {
    textDecorationLine: "underline",
  },
  textFaded: {
    color: "#555555",
    fontWeight: "500",
  },
  textMonday: {
    color: "#333",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

export const DAY_ITEM_WIDTH = DAY_WIDTH;
