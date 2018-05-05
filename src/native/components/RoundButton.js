import React from 'react';
import { View, StyleSheet } from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';


const RoundButton = ({size, onPress, title}) => (
  <View style={{paddingTop: 40}}>
    <ActionButton size={size} buttonColor="rgba(72,145,77,1)">
      <ActionButton.Item buttonColor='#e74c3c' title={title} onPress={onPress}>
        <Icon name="md-create" style={styles.actionButtonIcon} />
      </ActionButton.Item>
    </ActionButton>
  </View>
);

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  }
});

export default RoundButton;
