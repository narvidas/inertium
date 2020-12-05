import { Ionicons } from "@expo/vector-icons";
import { Button, H3, Input, Item, Label, Text } from "native-base";
import PropTypes from "prop-types";
import React from "react";
import { Keyboard, KeyboardAvoidingView, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

const ItemConfigModal = ({ visible, defaultValues, onSave, onClose, onClear, handleChange }) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={{ paddingTop: 50, height: 50 }}>
            <H3>Day Details</H3>
          </View>
          <View style={{ paddingTop: 50, width: 250 }}>
            <Item>
              <Label>Notes</Label>
              <Input
                style={{ marginBottom: 5 }}
                defaultValue={defaultValues}
                multiline
                maxHeight={100}
                autoGrow
                onChangeText={text => handleChange(text, "notes")}
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
            <Button onPress={onClear} title="Close modal" danger>
              <Ionicons name="ios-remove-circle-outline" style={styles.buttonIcon} />
              <Text>Clear Day</Text>
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </Modal>
);

ItemConfigModal.propTypes = {
  visible: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  handleChange: PropTypes.func,
  defaultValues: PropTypes.string,
};

ItemConfigModal.defaultProps = {
  visible: false,
  handleChange: null,
  defaultValues: "",
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

export default ItemConfigModal;
