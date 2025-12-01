import { Dimensions, StyleSheet } from "react-native";

const width = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  button: {
    borderColor: "#000066",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
  },
  buttonIcon: {
    marginLeft: 5,
    fontSize: 22,
    marginRight: 10,
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
