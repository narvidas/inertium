import { Ionicons } from "@expo/vector-icons";
import { Button, H3, Text } from "native-base";
import PropTypes from "prop-types";
import React from "react";
import { Keyboard, KeyboardAvoidingView, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

const HabitCustomisationModal = ({ visible, onClose }) => (
  <Modal visible={visible} onRequestClose={onClose} blurAmount={25}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={{ height: 50 }}>
            <H3>Customise Habit</H3>
          </View>

          <View style={{ paddingTop: 50, flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ marginLeft: 5 }}>
              <Button onPress={onClose} title="Close modal">
                <Ionicons name="ios-close" style={styles.buttonIcon} />
                <Text>Close</Text>
              </Button>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </Modal>
);

HabitCustomisationModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  handleChange: PropTypes.func,
};

HabitCustomisationModal.defaultProps = {
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

export default HabitCustomisationModal;
