import { H1, Text } from "native-base";
import React, { FC } from "react";
import { View } from "react-native";
import { styles } from "./Header.styles";

interface Props {
  title: string;
  content: string;
}

export const Header: FC<Props> = ({ title = "Header", content }) => (
  <View style={styles.container}>
    <H1 style={styles.title}>{title}</H1>
    {!!content && <Text>{content}</Text>}
  </View>
);
