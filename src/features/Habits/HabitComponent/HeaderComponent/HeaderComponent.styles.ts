import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    borderRadius: 4,
  },
  icon: {
    fontSize: 24,
    marginLeft: 5,
    marginRight: 5,
    color: "#555",
  },
});
