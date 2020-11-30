import { Container, Content } from "native-base";
import React from "react";
import platform from "../../../native-base-theme/variables/commonColor";

export const SampleScreen = () => {
  const { fontSizeH1, lineHeightH1, fontFamilyH1, textColor } = platform;
  return (
    <Container>
      <Content padder></Content>
    </Container>
  );
};
