import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Container, Content, Text, Button, List, ListItem, Left, Body } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Loading from './Loading';
import Error from './Error';
import Header from './Header';
import Spacer from './Spacer';
import HabitConfigModal from './HabitConfigModal';
import ItemConfigModal from './ItemConfigModal';
import RoundButton from './RoundButton';
import Habit from './Habit';
import { View, StyleSheet } from 'react-native';
import { Form, Item, Label, Input, Icon } from 'native-base';
import { generatePushID } from '../../lib/helpers';

import moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';


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

  closeItemModal = () => {
    this.setState({itemModalVisible:false});
  }

  closeHabitModal = () => {
    this.setState({habitModalVisible:false});
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

  render(){
    const { loading, error, member, habits, reFetch, toggleHabitItemStatus } = this.props;

    // Loading
    if (loading) return <Loading />;

    // Error
    if (error) return <Error content={error} />;

    return (
      <Container>
        <Content padder>
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
                defaultValues={{
                  name: this.state.habitName,
                  goal: this.state.habitGoal
                }}
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
            {habits.map(habit=>{
              return <Habit
                key={habit.key} 
                habitKey={habit.key} 
                title={habit.title}
                goal={habit.goal}
                items={habit.items} 
                toggleItemStatus={toggleHabitItemStatus}
                openItemModal={this.openItemModal}
                openHabitModal={this.openHabitModal}
                startingDate={this.state.startingDate}
              />
            })}
            <Spacer size={100} />  
            <RoundButton onPress={this.onNewHabit} title="New Habit" size={60}/>
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
  toggleHabitItemStatus: PropTypes.func,
  saveHabitItemNotes: PropTypes.func,
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
});

export default HabitListing;