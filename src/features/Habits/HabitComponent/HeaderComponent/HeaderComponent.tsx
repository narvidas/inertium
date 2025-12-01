import { Ionicons } from "@expo/vector-icons";
import { H3, Text, View } from "../../../../ui";
import React, { FC } from "react";
import { TouchableHighlight } from "react-native";
import { styles } from "./HeaderComponent.styles";

interface Props {
  title: string;
  goalProgress: string | null;
  onCogPress: () => void;
  onCalendarPress?: () => void;
  accessibilityLabel?: string;
}

// goal progress should be opacity 0.5 if it is not null
export const HeaderComponent: FC<Props> = ({ title, goalProgress, onCogPress, onCalendarPress, accessibilityLabel }) => (
  <View style={styles.container}>
    <View>
      <H3>{title}{` `}{goalProgress ? <H3 style={{ opacity: 0.25, fontWeight: "light" }}>({goalProgress})</H3> : null}</H3>
    </View>
    <View style={styles.buttonsContainer}>
      {onCalendarPress && (
        <TouchableHighlight
          activeOpacity={1}
          style={styles.button}
          underlayColor="rgba(0,0,0,0.1)"
          onPress={onCalendarPress}
          accessibilityLabel={`Monthly view for ${title}`}
        >
          <Ionicons name="calendar-outline" size={18} color="#666" style={{ marginLeft: 5, marginRight: 5 }} />
        </TouchableHighlight>
      )}
      <TouchableHighlight
        activeOpacity={1}
        style={styles.button}
        underlayColor="rgba(0,0,0,0.1)"
        onPress={onCogPress}
        accessibilityLabel={accessibilityLabel}
      >
        <Ionicons name="settings-sharp" size={20} color="#666" style={{ marginLeft: 5, marginRight: 5 }} />
      </TouchableHighlight>
    </View>
  </View>
);
