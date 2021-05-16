import { fireEvent } from "@testing-library/react-native";

export const refresh = (element: any) => fireEvent(element.props.refreshControl, "refresh", {});

// Not used at the moment, keeping as a reminder for future how to do swipes
/* istanbul ignore next */
export const swipeRight = (element: any) => {
  const eventData = {
    nativeEvent: {
      translationX: 200,
    },
  };

  fireEvent(element, "pan", eventData);
};
