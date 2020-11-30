import { H1, Text } from "native-base";
import PropTypes from "prop-types";
import React from "react";
import { View } from "react-native";
import Spacer from "./Spacer";

const Header = ({ title, content }) => (
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

Header.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
};

Header.defaultProps = {
  title: "Missing title",
  content: "",
};

export default Header;
