import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const AVAILABLE_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;
const DAY_WIDTH = Math.floor(AVAILABLE_WIDTH / 7);

export const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerContainer: {
    marginBottom: 4,
  },
  itemsContainer: {
    height: DAY_WIDTH,
  },
});

export const DAY_ITEM_WIDTH = DAY_WIDTH;
