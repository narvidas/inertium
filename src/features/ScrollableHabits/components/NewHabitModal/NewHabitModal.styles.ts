import { Dimensions, StyleSheet } from "react-native";

const width = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    fontSize: 22,
    height: 22,
    color: "white",
  },
  buttonContainer: {
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    marginBottom: 10,
  },
  inputContainer: {
    paddingTop: 50,
    width: (width / 3) * 2,
  },
});
