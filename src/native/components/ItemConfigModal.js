import React from 'react';
import PropTypes from 'prop-types';
import { H3, Text, Button, Form, Item, Label, Input } from 'native-base';
import { View, StyleSheet, Modal, KeyboardAvoidingView, TouchableWithoutFeedback} from 'react-native';
import { Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';

const ItemConfigModal = ({visible, defaultValues, type, onSave, onClose, onClear, handleChange}) => (
   <Modal
        visible={visible}
        animationType={'slide'}
        onRequestClose={onClose}
    >
     <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={{paddingTop: 50, height: 50}}>
            <H3>Day Details</H3>
          </View>
          <View style={{paddingTop: 50, width: 250}}>
            <Item >
              <Label>Notes</Label>
              <Input style={{marginBottom: 5}} defaultValue={defaultValues} multiline={true} maxHeight={100} autoGrow={true} onChangeText={text => handleChange(text,'notes')} />
            </Item>
          </View>
          <View style={{paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{marginRight: 5}}>
              <Button
                onPress={onSave}
                title="Close modal"
              >
              <Icon name="ios-checkmark" style={styles.buttonIcon} />
              <Text>Save</Text>
              </Button>
            </View>
            <View style={{marginLeft: 5}}>
              <Button
                  onPress={onClose}
                  title="Close modal"
              >
              <Icon name="ios-close" style={styles.buttonIcon} />
              <Text>Close</Text>
              </Button>
            </View>          
          </View>
          <View style={{paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              onPress={onClear}
              title="Close modal"
              danger
            >
            <Icon name="ios-remove-circle-outline" style={styles.buttonIcon} />
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
  type: PropTypes.bool,
  onSave: PropTypes.func,
  onClose: PropTypes.func,
  onClear: PropTypes.func,
  handleChange: PropTypes.func,
};

ItemConfigModal.defaultProps = {
  visible: false,
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

export default ItemConfigModal;
