import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

export default class HabitItem extends React.Component {
  setNativeProps = (nativeProps) => {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    const { id, startingDate, status } = this.props;
    const date = startingDate.clone().add(id, 'days');
    return (
      <View ref={component => this._root = component} {...this.props}>
        <View style={styles.dateContainer}>
          <Text style={status === 'done' ? styles.dateNameDone : styles.dateNameUndone}>
            { date.format('ddd').toUpperCase() }
          </Text>
          <Text style={status === 'done' ? styles.dateNumberDone : styles.dateNumberUndone}>
            { date.date() }
          </Text>
        </View>
      </View>
    );
  }
}

HabitItem.propTypes = {
  id: PropTypes.string.isRequired,
  startingDate: PropTypes.instanceOf(moment).isRequired,
  status: PropTypes.string,
};

HabitItem.defaultProps = {
  status: '',
};

const boxWH = Dimensions.get('window').width / 8;
const styles = StyleSheet.create({
  // CALENDAR DAY
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: boxWH / 7,
  },
  dateNameUndone: {
    textAlign: 'center',
    color: 'rgba(0,0,0,0.25)',
    fontSize: boxWH / 4,
  },
  dateNumberUndone: {
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.25)',
    textAlign: 'center',
    fontSize: boxWH / 3,
  },
  dateNameDone: {
    textAlign: 'center',
    color: '#fefefe',
    fontSize: boxWH / 4,
  },
  dateNumberDone: {
    fontWeight: 'bold',
    color: '#fefefe',
    textAlign: 'center',
    fontSize: boxWH / 3,
  },
});
