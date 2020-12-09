import { View } from "native-base";
import React, { FC } from "react";

interface Props {
  size?: number;
}

export const Spacer: FC<Props> = ({ size = 20 }) => <View style={{ marginTop: size }} />;
