import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const DAY_WIDTH = Math.floor(screenWidth / 7);

export const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerContainer: {
    paddingHorizontal: DAY_WIDTH / 2,
    marginBottom: 4,
  },
  itemsContainer: {
    height: DAY_WIDTH,
  },
});
