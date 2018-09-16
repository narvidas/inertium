import React from 'react';
import PropTypes from 'prop-types';
import { H3, List, ListItem, Icon } from 'native-base';
import { View, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';

import HabitItem from './HabitItem';
import Spacer from './Spacer';

class Habit extends React.Component {
  // shouldComponentUpdate(nextProps) {
  //   const { habitKey, updateKey } = nextProps;
  //   return habitKey === updateKey;
  // }

  getBoxStyle = (status) => {
    switch (status) {
      case 'done':
        return styles.boxDone;
      case 'undone':
        return styles.boxUndone;
      default:
        return styles.boxGrey;
    }
  }

  renderRow = (item, sectionID, rowID) => {
    const { toggleItemStatus, openItemModal, startingDate, habitKey, updateFocusedHabitKey } = this.props;
    return (
      <ListItem style={styles.list}>
        <View>
          <TouchableHighlight
            activeOpacity={1}
            underlayColor="rgba(0,0,0,0.25)"
            style={this.getBoxStyle(item.status)}
            onPress={() => {
              toggleItemStatus(item.key, habitKey, item.status, startingDate, rowID);
              updateFocusedHabitKey(habitKey);
            }}
            onLongPress={() => openItemModal(item.key, habitKey, item.notes, startingDate, rowID)}
          >
            <HabitItem id={rowID} startingDate={startingDate} status={item.status} />
          </TouchableHighlight>
        </View>
      </ListItem>
    );
  }

  render() {
    const { title, items, openHabitModal, habitKey, goal } = this.props;
    const completedGoalCount = String(items.filter(item => item.status === 'done').length);
    return (
      <View>
        <View style={{ paddingLeft: boxWH / 2, paddingRight: boxWH / 2, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <H3>{title}{' ('}{completedGoalCount}{'/'}{String(goal || 0)}{')'}</H3>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }} >
              <TouchableHighlight
                activeOpacity={1}
                style={{ borderRadius: 4 }}
                underlayColor="rgba(0,0,0,0.1)"
                onPress={() => openHabitModal(habitKey, title, goal)}
              >
                <Icon
                  name="ios-settings"
                  style={{
                    fontSize: 24, marginLeft: 5, marginRight: 5, color: '#555',
                  }}
                />
              </TouchableHighlight>
            </View>
          </View>
          <List
            dataArray={items}
            horizontal
            scrollEnabled={false}
            removeClippedSubviews={false}
            style={styles.list}
            renderRow={this.renderRow}
          />
        </View>
        <Spacer size={15} />
      </View>
    );
  }
}

Habit.propTypes = {
  openItemModal: PropTypes.func.isRequired,
  toggleItemStatus: PropTypes.func.isRequired,
  openHabitModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  startingDate: PropTypes.shape().isRequired,
  habitKey: PropTypes.string.isRequired,
  updateFocusedHabitKey: PropTypes.func.isRequired,
  goal: PropTypes.number,
};

Habit.defaultProps = {
  goal: 0,
};

const boxWH = Dimensions.get('window').width / 8;
const styles = StyleSheet.create({
  boxUndone: {
    width: boxWH,
    height: boxWH,
    backgroundColor: '#e58570',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'white',
    margin: 0,
  },
  boxDone: {
    width: boxWH,
    height: boxWH,
    backgroundColor: '#5A9C5E',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'white',
    margin: 0,
  },
  boxGrey: {
    width: boxWH,
    height: boxWH,
    backgroundColor: '#ededed',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'white',
    margin: 0,
  },
  list: {
    padding: 0,
    borderBottomWidth: 0,
    marginLeft: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginRight: 0,
  },
});

export default Habit;
