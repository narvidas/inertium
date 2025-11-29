import { Ionicons } from "@expo/vector-icons";
import React, { FC } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type Direction = "up" | "down";

interface Props {
  onPress: () => void;
  title: string;
  size?: number;
  direction?: Direction;
}

export const RoundButton: FC<Props> = ({ onPress, title, size = 56, direction = "down" }) => (
  <View style={fabStyles.container} testID="round-button">
    <TouchableOpacity
      style={[fabStyles.button, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#ffffff" />
    </TouchableOpacity>
    <Text style={fabStyles.label}>{title}</Text>
  </View>
);

const fabStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "rgba(72,145,77,1)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: "#48914d",
    fontWeight: "500",
  },
});
