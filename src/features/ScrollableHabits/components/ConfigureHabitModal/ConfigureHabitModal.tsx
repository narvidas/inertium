import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikErrors } from "formik";
import { Button, H3, Input, Item, Label, Root, Text } from "../../../../ui";
import React, { FC, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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
  onSave: (title: string, goal: number, noteTemplate?: string) => void;
  onClose: () => void;
  onRemove: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required!"),
  goal: Yup.number()
    .required("Weekly goal number is required!")
    .min(0, "Cannot be a negative number!")
    .max(7, "Week has only 7 days!")
    .typeError("Must be a numeric value!"),
  noteTemplate: Yup.string().max(1000, "Template cannot exceed 1000 characters"),
});

export const ConfigureHabitModal: FC<Props> = ({
  visible,
  defaultValues = { title: "", goal: "0", noteTemplate: "" },
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

  const submit = ({ title, goal, noteTemplate }: Values) => {
    if (title && goal) onSave(title, goal, noteTemplate);
  };

  if (!visible) return null;
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
                          accessibilityLabel="change habit name"
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
                          accessibilityLabel="change goal"
                          keyboardType="numeric"
                          name="goal"
                          defaultValue={String(defaultValues?.goal)}
                        />
                      </Item>
                    </View>
                    <View style={styles.inputContainer}>
                      <Item>
                        <Label>Note template (markdown):</Label>
                        <Input
                          style={styles.input}
                          onChangeText={handleChange("noteTemplate")}
                          accessibilityLabel="change note template"
                          name="noteTemplate"
                          multiline
                          lines={4}
                          defaultValue={defaultValues?.noteTemplate || ""}
                          placeholder="e.g. ## Workout&#10;- [ ] Squats&#10;- [ ] Bench"
                          maxHeight={150}
                          autoGrow
                        />
                      </Item>
                    </View>
                    <View style={styles.buttonContainer}>
                      <View style={{ marginRight: 10 }}>
                        <Button onPress={handleSubmit} success>
                          <Ionicons name="checkmark" style={styles.buttonIcon} />
                          <Text>Save</Text>
                        </Button>
                      </View>
                      <View>
                        <Button onPress={onClose} secondary>
                          <Ionicons name="close" style={styles.buttonIcon} />
                          <Text>Close</Text>
                        </Button>
                      </View>
                    </View>
                    <View style={styles.buttonContainer}>
                      <Button onPress={() => confirmRemoval(onRemove)} danger>
                        <Ionicons name="trash" style={styles.buttonIcon} />
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

