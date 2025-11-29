import React, { FC } from "react";
import { ActivityIndicator, View } from "react-native";

export const Loading: FC = () => (
  <View style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
    <ActivityIndicator size="large" color="#5A9C5E" />
  </View>
);
