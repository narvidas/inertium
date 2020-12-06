import React, { FC, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";
import { HabitComponent } from "../HabitComponent";
import { Habit } from "../types";

interface Props {
  habit: Habit;
  active: boolean;
  startOfWeek: Date;
}

export const Row: FC<Props> = ({ startOfWeek, habit, active }) => {
  const animation = useRef(new Animated.Value(0)).current;

  const style = useMemo(() => {
    return {
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            },
          ],
          shadowRadius: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          elevation: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    };
  }, [active]);

  useEffect(() => {
    Animated.timing(animation, {
      duration: 100,
      useNativeDriver: true,
      easing: Easing.bounce,
      toValue: active ? 1 : 0,
    }).start();
  }, [active]);

  return (
    <Animated.View style={style}>
      <HabitComponent habitId={habit.id} startOfWeek={startOfWeek} {...habit} />
    </Animated.View>
  );
};
