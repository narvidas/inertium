import { Toast } from "native-base";

export const errorToast = (message: string) => {
  Toast.show({
    text: message,
    duration: 3000,
    type: "danger",
    buttonText: "Close",
  });
};

export const successToast = (message: string) => {
  Toast.show({
    text: message,
    duration: 3000,
    type: "success",
    buttonText: "Close",
  });
};
