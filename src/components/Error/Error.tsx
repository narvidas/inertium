import { Container, Content, H3, Text } from "../../ui";
import React, { FC } from "react";

interface Props {
  title: string;
  content: string;
}

export const Error: FC<Props> = ({ title = "Oops!", content = "Something went wrong.." }) => (
  <Container>
    <Content>
      <H3>{title}</H3>
      <Text>{content}</Text>
    </Content>
  </Container>
);
