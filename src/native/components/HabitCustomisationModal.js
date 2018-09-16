import React from 'react';
import PropTypes from 'prop-types';
import { H3, Text, Button } from 'native-base';
import { View, StyleSheet, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

const HabitCustomisationModal = ({ visible, onClose, handleChange }) => (
  <Modal
    visible={visible}
    onRequestClose={onClose}
    blurAmount={25}
  >
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={{ height: 50 }}>
            <H3>Customise Habit</H3>
          </View>

          <View style={{ paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ marginLeft: 5 }}>
              <Button
                onPress={onClose}
                title="Close modal"
              >
                <Icon name="ios-close" style={styles.buttonIcon} />
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
    borderColor: '#000066',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
  },
  buttonIcon: {
    marginLeft: 15,
    fontSize: 22,
    height: 22,
    color: 'white',
  },
});

export default HabitCustomisationModal;
