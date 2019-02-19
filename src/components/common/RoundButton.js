import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';


const RoundButton = ({ size, onPress, title, direction }) => (
  <View style={{ paddingTop: 80, paddingBottom: 30 }}>
    <ActionButton size={size} buttonColor="rgba(72,145,77,1)" verticalOrientation={direction}>
      <ActionButton.Item buttonColor="#e74c3c" title={title} onPress={onPress}>
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
  },
});

RoundButton.propTypes = {
  size: PropTypes.number,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string,
  direction: PropTypes.string,
};

RoundButton.defaultProps = {
  size: 50,
  title: '',
  direction: 'down',
};

export default RoundButton;
