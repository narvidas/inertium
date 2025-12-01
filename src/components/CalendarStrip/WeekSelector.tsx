import React, { FC } from "react";
import { Image, TouchableOpacity } from "react-native";
import { styles } from "./CalendarStrip.styles";
import { WeekSelectorProps } from "./types";

// Import arrow images
const leftArrow = require("./img/left-arrow-black.png");
const rightArrow = require("./img/right-arrow-black.png");

export const WeekSelector: FC<WeekSelectorProps> = ({
  direction,
  onPress,
  iconContainerStyle,
  size,
}) => {
  const imageSource = direction === "left" ? leftArrow : rightArrow;
  const imageSize = { width: size, height: size };

  return (
    <TouchableOpacity
      style={[styles.iconContainer, iconContainerStyle]}
      onPress={onPress}
    >
      <Image
        style={[styles.icon, imageSize]}
        source={imageSource}
      />
    </TouchableOpacity>
  );
};

