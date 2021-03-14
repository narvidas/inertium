import { H3, Icon, View } from "native-base";
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
        <Icon name="ios-settings" style={styles.icon} />
      </TouchableHighlight>
    </View>
  </View>
);
