import { H1, Text } from "native-base";
import React, { FC } from "react";
import { View } from "react-native";
import { Spacer } from "../Spacer";

interface Props {
  title: string;
  content: string;
}

export const Header: FC<Props> = ({ title = "Header", content }) => (
  <View>
    <Spacer size={25} />
    <H1>{title}</H1>
    {!!content && (
      <View>
        <Spacer size={10} />
        <Text>{content}</Text>
      </View>
    )}
    <Spacer size={25} />
  </View>
);

export default Header;
