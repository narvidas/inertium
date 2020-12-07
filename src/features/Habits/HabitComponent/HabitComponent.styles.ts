import { Dimensions, StyleSheet } from "react-native";

const boxWH = Dimensions.get("window").width / 8;
export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: boxWH / 2,
  },
  list: {
    padding: 0,
    borderBottomWidth: 0,
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
  },
});
