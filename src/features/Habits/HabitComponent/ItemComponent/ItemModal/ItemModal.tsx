import { Ionicons } from "@expo/vector-icons";
import { Formik, FormikErrors } from "formik";
import { Button, H3, Input, Item, Label, Root, Text } from "native-base";
import React, { FC, useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, View } from "react-native";
import * as Yup from "yup";
import { errorToast } from "../../../../../utils/toast";
import { Item as ItemType } from "../../../types";
import { styles } from "./ItemModal.styles";

type Values = Partial<ItemType>;

interface Props {
  visible: boolean;
  defaultValues: Values;
  onSave: (notes: string) => void;
  onClose: () => void;
}

const validationSchema = Yup.object().shape({
  notes: Yup.string().max(1000, "Cannot be more than 1000 symbols"),
});

export const ItemModal: FC<Props> = ({ visible, defaultValues, onSave, onClose }) => {
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  // Using safe defaults for error values (extra safety), in practise impossible hence ignored in coverage
  /* istanbul ignore next */
  const updateError = (errors: FormikErrors<Values> = {}) => {
    const errorMessages = Object.values(errors);
    const errorMessagesExist = errorMessages.length > 0;
    if (errorMessagesExist) setError(errorMessages[0]);
  };

  const submit = ({ notes }: Values) => {
    onSave(notes || "");
    onClose();
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
                      <H3>Update Item</H3>
                    </View>
                    <View style={styles.inputContainer}>
                      <Item>
                        <Label>Notes:</Label>
                        <Input
                          style={styles.input}
                          onChangeText={handleChange("notes")}
                          accessibilityLabel="change item notes"
                          name="notes"
                          multiline
                          defaultValue={defaultValues.notes}
                          maxHeight={100}
                          autoGrow
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
