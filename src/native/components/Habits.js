import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Container, Content, Text, Button, List, ListItem, Left, Body} from 'native-base';

import { Actions } from 'react-native-router-flux';
import Loading from './Loading';
import Error from './Error';
import Header from './Header';
import Spacer from './Spacer';
import HabitConfigModal from './HabitConfigModal';
import HabitCustomisationModal from './HabitCustomisationModal';
import ItemConfigModal from './ItemConfigModal';
import RoundButton from './RoundButton';
import Habit from './Habit';
import { View, StyleSheet } from 'react-native';
import { Form, Item, Label, Input, Icon, ListView } from 'native-base';
import { generatePushID } from '../../lib/helpers';

import moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';

import SortableList from 'react-native-sortable-list';
import { Animated, Easing, Dimensions, Platform, ScrollView } from 'react-native';


class Row extends React.Component {

  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);
    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },
        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  render() {
   const {data, active, index, toggleItemStatus, saveHabit, openItemModal, openHabitModal, startingDate} = this.props;
   const {key, title, goal, items} = data;
    return (
      <Animated.View style={[
        styles.row,
        this._style,
      ]}>
        <Habit
          key={key}
          habitKey={key}
          title={title}
          goal={goal}
          items={items}
          toggleItemStatus={toggleItemStatus}
          openItemModal={openItemModal}
          openHabitModal={openHabitModal}
          startingDate={startingDate}
          updateTest={saveHabit}
        />
      </Animated.View>
    );
  }
}

class HabitListing extends React.Component {

  constructor(props) {
    super(props);
  }

  state = {
    itemModalVisible: false,
    activeItem: null,
    itemNotes: '',
    habitModalVisible: false,
    activeHabit: null,
    habitName: '',
    habitGoal: 0,
    activeRowID: null,
    habitCustomisationModalVisible: false,
    startingDate: moment().startOf("isoweek"),
  };

  saveItem = () => {
    const {activeItem, activeHabit, notes, startingDate, activeRowID} = this.state;
    this.props.saveHabitItemNotes(activeItem, activeHabit, notes, startingDate, activeRowID);
    this.closeItemModal();
  }

  clearItem = () => {
    const {activeItem, activeHabit, startingDate, activeRowID} = this.state;
    this.props.clearHabitItem(activeItem, activeHabit, startingDate, activeRowID);
    this.closeItemModal();
  }

  handleNewWeekSelection = (startingDate) => {
    this.setState({
      startingDate: startingDate
    });
    this.props.getWeek(startingDate);
  }

  saveHabit = () => {
    const {activeHabit, habitName, habitGoal} = this.state;
    this.props.saveHabit(activeHabit, habitName, habitGoal)
    this.closeHabitModal();
  }

  openItemModal = (itemKey, habitKey, notes, startingDate, rowID) => {
    this.setState({
      itemModalVisible:true,
      itemNotes: notes,
      activeItem: itemKey,
      activeHabit: habitKey,
      startingDate: startingDate,
      activeRowID: rowID,
    });
  }

  openHabitModal = (key, name = '', goal=0) => {
    this.setState({
      habitModalVisible:true,
      habitName: name,
      activeHabit: key,
      habitGoal: goal,
    });
  }

  openHabitCustomisationModal = () => {
    this.setState({
      habitModalVisible:false,
      habitCustomisationModalVisible:true,
    });
  }

  closeItemModal = () => {
    this.setState({itemModalVisible:false});
  }

  closeHabitModal = () => {
    this.setState({habitModalVisible:false});
  }

  closeHabitCustomisationModal = () => {
    this.setState({
      habitModalVisible: true,
      habitCustomisationModalVisible:false,
    });
  }

  handleChange = (text, target) => {
    this.setState({
      ...this.state,
      [target]: text
    });
  }

  onNewHabit = () => {
    const {createHabit, habits} = this.props;
    const {startingDate} = this.state;
    const habitKey = generatePushID();
    createHabit(startingDate, habitKey)
    .then(()=>this.openHabitModal(habitKey, '', 0))
  }

  onRemoveHabit = () => {
    const {activeHabit} = this.state;
    const {removeHabit} = this.props;
    removeHabit(activeHabit)
    .then(()=>this.closeHabitModal());
  }

  renderRow = ({data, active, index}) => {
    const {habits} = this.props;
    return(
      <View>
        <Row
          data={data}
          active={active}
          index={index}
          toggleItemStatus={this.props.toggleHabitItemStatus}
          openItemModal={this.openItemModal}
          openHabitModal={this.openHabitModal}
          startingDate={this.state.startingDate}
          saveHabit={this.props.saveHabit}
        />
        {((habits.length) === index+1) ?
          <RoundButton onPress={this.onNewHabit} title="New Habit" size={60}/>
          :
          null
        }
      </View>
    )
  }

  render(){
    const { loading, error, member, habits, reFetch, toggleHabitItemStatus } = this.props;

    // Loading
    if (loading) return <Loading />;

    // Error
    if (error) return <Error content={error} />;

    return (
      <Container>
        <Content padder scrollEnabled={false}>
          <View>
            <ItemConfigModal
                visible={this.state.itemModalVisible}
                onSave={this.saveItem}
                onClose={this.closeItemModal}
                onClear={this.clearItem}
                handleChange={this.handleChange}
                defaultValues={this.state.itemNotes}
              />
            <HabitConfigModal
                visible={this.state.habitModalVisible}
                onSave={this.saveHabit}
                onClose={this.closeHabitModal}
                onRemove={this.onRemoveHabit}
                handleChange={this.handleChange}
                onCustomise={this.openHabitCustomisationModal}
                defaultValues={{
                  name: this.state.habitName,
                  goal: this.state.habitGoal
                }}
              />
            <HabitCustomisationModal
                visible={this.state.habitCustomisationModalVisible}
                onClose={this.closeHabitCustomisationModal}
                handleChange={this.handleChange}
              />
            <View>
              <CalendarStrip
                updateWeek={false}
                daySelectionAnimation={{type: 'border', duration: 10, borderWidth: 1, borderHighlightColor: 'rgba(0,0,0,0.8)'}}
                style={{height: 100, paddingTop: 20, paddingBottom: 20}}
                calendarHeaderStyle={{paddingBottom: 20}}
                highlightDateNumberStyle={{textDecorationLine: 'underline'}}
                styleWeekend={false}
                onWeekChanged={this.handleNewWeekSelection}
              />
              <Spacer size={10} />
            </View>
              <SortableList
                style={styles.list}
                contentContainerStyle={styles.contentContainer}
                data={habits}
                renderRow={this.renderRow}
                />
          </View>
        </Content>
      </Container>
    );
  }
};


HabitListing.propTypes = {
  error: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  reFetch: PropTypes.func,
  toggleHabitItemStatus: PropTypes.func.isRequired,
  saveHabitItemNotes: PropTypes.func.isRequired,
};

HabitListing.defaultProps = {
  error: null,
  reFetch: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button: {
    borderColor: '#000066',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  contentContainer: {
    width: window.width,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 10,
  },
});

export default HabitListing;
