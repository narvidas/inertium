import PropTypes from "prop-types";
import React from "react";
import { Animated, Easing, Platform } from "react-native";
import Habit from "./Habit";

export default class Row extends React.Component {
  constructor() {
    this._active = new Animated.Value(0);
    this._style = {
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              }),
            },
          ],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },
        android: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 1300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  render() {
    const {
      data,
      updateKey,
      toggleItemStatus,
      updateFocusedHabitKey,
      saveHabit,
      openItemModal,
      openHabitModal,
      startingDate,
    } = this.props;

    const { key, title, goal, items } = data;

    return (
      <Animated.View style={[this._style]}>
        <Habit
          key={key}
          habitKey={key}
          title={title}
          goal={goal}
          items={items}
          updateKey={updateKey}
          updateFocusedHabitKey={updateFocusedHabitKey}
          toggleItemStatus={toggleItemStatus}
          openItemModal={openItemModal}
          openHabitModal={openHabitModal}
          startingDate={startingDate}
          updateTest={saveHabit}
        />
      </Animated.View>
    );
  }
}

Row.propTypes = {
  // data: PropTypes.shape().isRequired,
  updateKey: PropTypes.string,
  active: PropTypes.bool,
  toggleItemStatus: PropTypes.func.isRequired,
  updateFocusedHabitKey: PropTypes.func.isRequired,
  saveHabit: PropTypes.func.isRequired,
  openItemModal: PropTypes.func.isRequired,
  openHabitModal: PropTypes.func.isRequired,
  startingDate: PropTypes.shape().isRequired,
};

Row.defaultProps = {
  updateKey: null,
  active: false,
};
