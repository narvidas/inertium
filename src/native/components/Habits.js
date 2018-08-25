
import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'native-base';
import CalendarStrip from 'react-native-calendar-strip';
import SortableListView from 'react-native-sortable-listview';
import GestureRecognizer from 'react-native-swipe-gestures';
import moment from 'moment';
import { View, StyleSheet, Animated, Easing, Platform, TouchableHighlight, RefreshControl } from 'react-native';

import Loading from './Loading';
import Error from './Error';
import HabitConfigModal from './HabitConfigModal';
import HabitCustomisationModal from './HabitCustomisationModal';
import ItemConfigModal from './ItemConfigModal';
import RoundButton from './RoundButton';
import Habit from './Habit';
import { generatePushID } from '../../lib/helpers';

// import { FacebookAds } from 'expo';


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
      }),
    };
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
    const {
      data, updateKey, toggleItemStatus, updateFocusedHabitKey,
      saveHabit, openItemModal, openHabitModal, startingDate,
    } = this.props;

    const { key, title, goal, items } = data;

    return (
      <Habit
        key={key}
        habitKey={key}
        title={title}
        goal={goal}
        items={items}
        updateKey={updateKey}
        updateFocusedHabitKey={updateFocusedHabitKey}
        toggleItemStatus={toggleItemStatus}
        openItemModal={openItemModal}
        openHabitModal={openHabitModal}
        startingDate={startingDate}
        updateTest={saveHabit}
        {...this.props.sortHandlers}
      />
    );
  }
}

class HabitListing extends React.Component {
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
    startingDate: moment().startOf('isoweek'),
    updateKey: null,
    refreshing: false,
  };
  
  onRefresh = () => {
    const { startingDate } = this.state;
    this.setState({ refreshing: true });
    this.props.fetchHabits(true, startingDate).then(() => {
      this.setState({ refreshing: false });
    });
  }

  onRemoveHabit = () => {
    const { activeHabit } = this.state;
    const { removeHabit } = this.props;
    removeHabit(activeHabit)
      .then(() => this.closeHabitModal());
  }

  onNewHabit = () => {
    const { createHabit } = this.props;
    const { startingDate } = this.state;
    const habitKey = generatePushID();
    createHabit(startingDate, habitKey)
      .then(() => this.openHabitModal(habitKey, '', 0))
      .then(() => this.forceUpdate());
  }

  handleNewWeekSelection = (startingDate) => {
    this.setState({
      startingDate,
    });
    this.props.getWeek(startingDate)
      .then(() => this.props.fetchHabits(startingDate))
      .then(() => this.props.getWeek(startingDate));
  }

  updateFocusedHabitKey = (key) => {
    this.setState({
      updateKey: key,
    });
  }

  saveHabit = () => {
    const { activeHabit, habitName, habitGoal } = this.state;
    this.props.saveHabit(activeHabit, habitName, habitGoal);
    this.updateFocusedHabitKey(activeHabit);
    this.closeHabitModal();
  }

  openItemModal = (itemKey, habitKey, notes, startingDate, rowID) => {
    this.setState({
      itemModalVisible: true,
      itemNotes: notes,
      activeItem: itemKey,
      activeHabit: habitKey,
      startingDate,
      activeRowID: rowID,
      scrollHabits: true,
      adShown: false,
    });
  }

  openHabitModal = (key, name = '', goal = 0) => {
    this.setState({
      habitModalVisible: true,
      habitName: name,
      activeHabit: key,
      habitGoal: goal,
    });
  }

  openHabitCustomisationModal = () => {
    this.setState({
      habitModalVisible: false,
      habitCustomisationModalVisible: true,
    });
  }

  closeItemModal = () => {
    this.setState({ itemModalVisible: false });
  }

  closeHabitModal = () => {
    this.setState({ habitModalVisible: false });
  }

  closeHabitCustomisationModal = () => {
    this.setState({
      habitModalVisible: true,
      habitCustomisationModalVisible: false,
    });
  }

  handleChange = (text, target) => {
    this.setState({
      ...this.state,
      [target]: text,
    });
  }

  reorderRows = (move) => {
    this.enableHabitListScroll();
    const { reorderHabits, habits } = this.props;
    const prevOrder = habits.map(h => h.key);
    reorderHabits(prevOrder, move.from, move.to, move.row.data.key)
      .then(() => this.forceUpdate());
  }

  enableHabitListScroll = () => {
    this.setState({ scrollHabits: true });
  }

  disableHabitListScroll = () => {
    this.setState({ scrollHabits: false });
  }

  saveItem = () => {
    const { activeItem, activeHabit, notes, startingDate, activeRowID } = this.state;
    this.props.saveHabitItemNotes(activeItem, activeHabit, notes, startingDate, activeRowID);
    this.updateFocusedHabitKey(activeHabit);
    this.closeItemModal();
  }

  clearItem = () => {
    const { activeItem, activeHabit, startingDate, activeRowID } = this.state;
    this.props.clearHabitItem(activeItem, activeHabit, startingDate, activeRowID);
    this.closeItemModal();
  };

  renderRow = (row) => {
    return (
      <TouchableHighlight {...this.props.sortHandlers} underlayColor={null}>
        <View {...this.props.sortHandlers}>
          <Row
            data={row}
            toggleItemStatus={this.props.toggleHabitItemStatus}
            openItemModal={this.openItemModal}
            openHabitModal={this.openHabitModal}
            startingDate={this.state.startingDate}
            saveHabit={this.props.saveHabit}
            updateFocusedHabitKey={this.updateFocusedHabitKey}
            updateKey={this.state.updateKey}
            {...this.props.sortHandlers}
          />
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const { loading, error, habits, habitOrder } = this.props;

    // Loading
    if (loading) return <Loading />;

    // Error
    if (error) return <Error content={error} />;

    // const placementId = "205216370287292_205223896953206";
    // if (!this.state.adShown){
    //   this.state.adShown = true
    //   setTimeout(()=>{
    //     FacebookAds.InterstitialAdManager.showAd(placementId)
    //       .then(didClick => {})
    //       .catch(error => {})
    //   }, 10000);
    // }

    return (
      <Container>
        <View style={{ paddingBottom: 20 }}>
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
              goal: this.state.habitGoal,
            }}
          />
          <HabitCustomisationModal
            visible={this.state.habitCustomisationModalVisible}
            onClose={this.closeHabitCustomisationModal}
            handleChange={this.handleChange}
          />
          <GestureRecognizer
            onSwipeLeft={() => this.calendar.getNextWeek()}
            onSwipeRight={() => this.calendar.getPreviousWeek()}
          >
            <CalendarStrip
              ref={(calendar) => { this.calendar = calendar; }}
              updateWeek={false}i
              daySelectionAnimation={{ type: 'border', duration: 100, borderWidth: 1, borderHighlightColor: 'rgba(0,0,0,0.8)' }}
              style={{ height: 100, paddingTop: 20, paddingBottom: 15 }}
              calendarHeaderStyle={{ paddingBottom: 15 }}
              highlightDateNumberStyle={{ textDecorationLine: 'underline' }}
              iconContainer={{ width: 40 }}
              styleWeekend={false}
              onWeekChanged={this.handleNewWeekSelection}
            />
          </GestureRecognizer>
        </View>
        <SortableListView
          style={styles.list}
          data={(habits[0].placeholder || habitOrder.length < 1) ?
            habits :
            habitOrder
              .map(hid => habits.find(h => h.key === hid))
              .filter(h => h !== undefined)
          }
          limitScrolling={true}
          onRowActive={this.disableHabitListScroll}
          onMoveEnd={this.enableHabitListScroll}
          onRowMoved={this.reorderRows}
          renderRow={this.renderRow}
          renderFooter={() => <RoundButton onPress={this.onNewHabit} title="New Habit" size={60}/>}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
        />
      </Container>
    );
  }
}

HabitListing.propTypes = {
  error: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  habitOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  reFetch: PropTypes.func,
  toggleHabitItemStatus: PropTypes.func.isRequired,
  saveHabitItemNotes: PropTypes.func.isRequired,
  reorderHabits: PropTypes.func.isRequired,
  fetchHabits: PropTypes.func.isRequired,
  removeHabit: PropTypes.func.isRequired,
  createHabit: PropTypes.func.isRequired,
};

Row.propTypes = {
  data: PropTypes.object.isRequired,
  updateKey: PropTypes.string,
  toggleItemStatus: PropTypes.func.isRequired,
  updateFocusedHabitKey: PropTypes.func.isRequired,
  saveHabit: PropTypes.func.isRequired,
  openItemModal: PropTypes.func.isRequired,
  openHabitModal: PropTypes.func.isRequired,
  startingDate: PropTypes.object.isRequired,
}

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
