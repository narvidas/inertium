import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikErrors } from "formik";
import { Button, H3, Input, Item, Label, Root, Text } from "native-base";
import React, { FC, useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, View } from "react-native";
import * as Yup from "yup";
import { errorToast } from "../../../../utils/toast";
import { Habit } from "../../types";
import { styles } from "./ConfigureHabitModal.styles";

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
  goal: Yup.number()
    .required("Weekly goal number is required!")
    .typeError("Must be a numeric value!"),
});

export const ConfigureHabitModal: FC<Props> = ({
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
    if (title && goal) onSave(title, goal);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Root>
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
                    <View>
                      <H3>Edit Habit</H3>
                    </View>
                    <View style={styles.inputContainer}>
                      <Item>
                        <Label>Habit name:</Label>
                        <Input
                          style={styles.input}
                          onChangeText={handleChange("title")}
                          name="title"
                          defaultValue={defaultValues?.title}
                        />
                      </Item>
                    </View>
                    <View style={styles.inputContainer}>
                      <Item>
                        <Label>Weekly goal:</Label>
                        <Input
                          style={styles.input}
                          onChangeText={handleChange("goal")}
                          keyboardType="numeric"
                          name="goal"
                          defaultValue={String(defaultValues?.goal)}
                        />
                      </Item>
                    </View>
                    <View style={styles.buttonContainer}>
                      <View style={{ marginRight: 10 }}>
                        <Button onPress={handleSubmit} success>
                          <Ionicons name="ios-checkmark" style={styles.buttonIcon} />
                          <Text>Save</Text>
                        </Button>
                      </View>
                      <View>
                        <Button onPress={onClose}>
                          <Ionicons name="ios-close" style={styles.buttonIcon} />
                          <Text>Close</Text>
                        </Button>
                      </View>
                    </View>
                    <View style={styles.buttonContainer}>
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
      </Root>
    </Modal>
  );
};
