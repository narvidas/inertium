import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const AVAILABLE_WIDTH = screenWidth - HORIZONTAL_PADDING * 2;
const DAY_WIDTH = Math.floor(AVAILABLE_WIDTH / 7);

export const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerContainer: {
    paddingBottom: 4,
  },
  itemsContainer: {
    height: DAY_WIDTH + 6,
  },
});

export const DAY_ITEM_WIDTH = DAY_WIDTH;
