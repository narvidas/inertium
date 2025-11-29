import { Ionicons } from "@expo/vector-icons";
import { H3, View } from "../../../../ui";
import React, { FC } from "react";
import { TouchableHighlight } from "react-native";
import { styles } from "./HeaderComponent.styles";

interface Props {
  title: string;
  onCogPress: () => void;
  accessibilityLabel?: string;
}

export const HeaderComponent: FC<Props> = ({ title, onCogPress, accessibilityLabel }) => (
  <View style={styles.container}>
    <View>
      <H3>{title}</H3>
    </View>
    <View>
      <TouchableHighlight
        activeOpacity={1}
        style={styles.button}
        underlayColor="rgba(0,0,0,0.1)"
        onPress={onCogPress}
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="settings-outline" size={24} color="#555" style={{ marginLeft: 5, marginRight: 5 }} />
      </TouchableHighlight>
    </View>
  </View>
);
