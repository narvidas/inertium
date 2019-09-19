import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const Item = props => {
  const { id, startingDate, status } = props;
  const date = startingDate.clone().add(id, 'days');
  const weekDay = date.format('ddd').toUpperCase();
  const weekDate = date.date();
  return (
    <View style={styles.dateContainer}>
      <Text
        style={status === 'done' ? styles.dateNameDone : styles.dateNameUndone}
      >
        {weekDay}
      </Text>
      <Text
        style={
          status === 'done' ? styles.dateNumberDone : styles.dateNumberUndone
        }
      >
        {weekDate}
      </Text>
    </View>
  );
};

Item.propTypes = {
  id: PropTypes.number.isRequired,
  startingDate: PropTypes.instanceOf(moment).isRequired,
  status: PropTypes.string,
};

Item.defaultProps = {
  status: '',
};

export default Item;

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
