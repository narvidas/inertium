import { Icon } from "native-base";
import React, { FC } from "react";
import { View } from "react-native";
import ActionButton from "react-native-action-button";
import { styles } from "./RoundButton.styles";

type Direction = "up" | "down";

interface Props {
  onPress: () => void;
  title: string;
  size?: number;
  direction?: Direction;
}

export const RoundButton: FC<Props> = ({ onPress, title, size = 50, direction = "down" }) => (
  <View style={styles.container}>
    <ActionButton size={size} buttonColor="rgba(72,145,77,1)" verticalOrientation={direction}>
      <ActionButton.Item buttonColor="#e74c3c" title={title} onPress={onPress}>
        <Icon name="md-create" style={styles.icon} />
      </ActionButton.Item>
    </ActionButton>
  </View>
);
