import { Container, Content, H3, Text } from "native-base";
import PropTypes from "prop-types";
import React from "react";

const Error = ({ title, content }) => (
  <Container>
    <Content>
      <H3>{title}</H3>
      <Text>{content}</Text>
    </Content>
  </Container>
);

Error.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
};

Error.defaultProps = {
  title: "Oops",
  content: "Something went wrong.",
};

export default Error;
