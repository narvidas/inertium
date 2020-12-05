import { Ionicons } from "@expo/vector-icons";
import { Button, H3, Input, Item, Label, Text } from "native-base";
import PropTypes from "prop-types";
import React from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

const confirmRemoval = onRemove => {
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

const HabitConfigModal = ({ visible, defaultValues, onSave, onClose, onRemove, onCustomise, handleChange }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose} blurAmount={25}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={{ height: 50 }}>
            <H3>Configure Habit</H3>
          </View>
          <View style={{ paddingTop: 50, width: 250 }}>
            <Item>
              <Label>Name:</Label>
              <Input defaultValue={defaultValues.name} onChangeText={text => handleChange(text, "habitName")} />
            </Item>
          </View>
          <View style={{ paddingTop: 50, width: 250 }}>
            <Item>
              <Label>Weekly goal:</Label>
              <Input
                defaultValue={String(defaultValues.goal)}
                keyboardType="numeric"
                onChangeText={text => handleChange(Number(text) || 0, "habitGoal")}
              />
            </Item>
          </View>
          <View style={{ paddingTop: 50, flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ marginRight: 5 }}>
              <Button onPress={onSave} title="Close modal">
                <Ionicons name="ios-checkmark" style={styles.buttonIcon} />
                <Text>Save</Text>
              </Button>
            </View>
            <View style={{ marginLeft: 5 }}>
              <Button onPress={onClose} title="Close modal">
                <Ionicons name="ios-close" style={styles.buttonIcon} />
                <Text>Close</Text>
              </Button>
            </View>
          </View>
          <View style={{ paddingTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
            <Button onPress={() => confirmRemoval(onRemove)} title="Remove" danger>
              <Ionicons name="md-trash" style={styles.buttonIcon} />
              <Text>Remove habit</Text>
            </Button>
          </View>
          <View style={{ paddingTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
            <Button onPress={onCustomise} title="Customise habit" info>
              <Ionicons name="ios-color-wand" style={styles.buttonIcon} />
              <Text>Customise</Text>
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </Modal>
);

HabitConfigModal.propTypes = {
  visible: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  handleChange: PropTypes.func,
};

HabitConfigModal.defaultProps = {
  visible: false,
  handleChange: null,
};

const styles = StyleSheet.create({
  button: {
    borderColor: "#000066",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
  },
  buttonIcon: {
    marginLeft: 15,
    fontSize: 22,
    height: 22,
    color: "white",
  },
});

export default HabitConfigModal;
