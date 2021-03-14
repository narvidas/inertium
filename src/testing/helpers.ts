import { fireEvent } from "@testing-library/react-native";

export const refresh = (element: any) => fireEvent(element.props.refreshControl, "refresh", {});

const swipeRight = (element: any) => {
  const eventData = {
    nativeEvent: {
      translationX: 200,
    },
  };

  fireEvent(element, "pan", eventData);
};
