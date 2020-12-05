import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikErrors } from "formik";
import { Button, H3, Input, Item, Label, Text } from "native-base";
import React, { FC, useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, View } from "react-native";
import * as Yup from "yup";
import { errorToast } from "../../../utils/toast";
import { Habit } from "../types";
import { styles } from "./HabitConfigModal.styles";

const confirmRemoval = (onRemove: () => void) => {
  Alert.alert(
    "Remove habit",
    "Are you sure? \n\nThis operation cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: onRemove },
    ],
    { cancelable: false },
  );
};

type Values = Partial<Habit>;

interface Props {
  visible: boolean;
  defaultValues?: Values;
  onSave: (title: string, goal: number) => void;
  onClose: () => void;
  onRemove: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required!"),
  goal: Yup.number().required("Weekly goal number is required!"),
});

export const HabitConfigModal: FC<Props> = ({
  visible,
  defaultValues = { title: "", goal: "0" },
  onSave,
  onClose,
  onRemove,
}) => {
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  const updateError = (errors: FormikErrors<Values>) => {
    if (errors) {
      const errorMessages = Object.values(errors);
      const errorMessagesExist = errorMessages.length > 0;
      if (errorMessagesExist) setError(errorMessages[0]);
    }
  };

  const submit = ({ title, goal }: Values) => {
    onSave(title, goal);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Formik
            validationSchema={validationSchema}
            onSubmit={submit}
            validateOnChange={false}
            validateOnBlur={false}
            initialValues={{ ...defaultValues }}
            render={({ handleChange, handleSubmit, errors }) => (
              <>
                {updateError(errors)}
                <View style={styles.container}>
                  <View style={{ height: 50 }}>
                    <H3>Configure Habit</H3>
                  </View>
                  <View style={{ paddingTop: 50, width: 250 }}>
                    <Item>
                      <Label>Name:</Label>
                      <Input onChangeText={handleChange("title")} name="title" defaultValue={defaultValues?.title} />
                    </Item>
                  </View>
                  <View style={{ paddingTop: 50, width: 250 }}>
                    <Item>
                      <Label>Weekly goal:</Label>
                      <Input
                        onChangeText={handleChange("goal")}
                        keyboardType="numeric"
                        name="goal"
                        defaultValue={String(defaultValues?.goal)}
                      />
                    </Item>
                  </View>
                  <View style={{ paddingTop: 50, flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ marginRight: 5 }}>
                      <Button onPress={handleSubmit}>
                        <Ionicons name="ios-checkmark" style={styles.buttonIcon} />
                        <Text>Save</Text>
                      </Button>
                    </View>
                    <View style={{ marginLeft: 5 }}>
                      <Button onPress={onClose}>
                        <Ionicons name="ios-close" style={styles.buttonIcon} />
                        <Text>Close</Text>
                      </Button>
                    </View>
                  </View>
                  <View style={{ paddingTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
                    <Button onPress={() => confirmRemoval(onRemove)} danger>
                      <Ionicons name="md-trash" style={styles.buttonIcon} />
                      <Text>Remove habit</Text>
                    </Button>
                  </View>
                </View>
              </>
            )}
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};
