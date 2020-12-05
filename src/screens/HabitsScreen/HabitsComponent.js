import moment from "moment";
import { Container } from "native-base";
import PropTypes from "prop-types";
import React from "react";
import { RefreshControl, StyleSheet, TouchableHighlight, View } from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import SortableListView from "react-native-sortable-listview";
import GestureRecognizer from "react-native-swipe-gestures";
import { updateHabitOrder } from "../../actions/habits/remote";
import RoundButton from "../../components/common/RoundButton";
import HabitConfigModal from "../../components/modals/HabitConfigModal";
import HabitCustomisationModal from "../../components/modals/HabitCustomisationModal";
import ItemConfigModal from "../../components/modals/ItemConfigModal";
import Row from "../../components/Row";
import { generatePushID } from "../../utils/helpers";

export class HabitsScreen extends React.Component {
  state = {
    itemModalVisible: false,
    activeItem: null,
    itemNotes: "",
    habitModalVisible: false,
    activeHabit: null,
    habitName: "",
    habitGoal: 0,
    activeRowID: null,
    habitCustomisationModalVisible: false,
    startingDate: moment().startOf("isoweek"),
    updateKey: null,
    refreshing: false,
    activeRow: null,
  };

  onRefresh = async () => {
    const { startingDate } = this.state;
    this.setState({ refreshing: true });
    await this.props.fetchHabits(startingDate);
    this.setState({ refreshing: false });
  };

  onRemoveHabit = async () => {
    const { activeHabit } = this.state;
    const { removeHabit, habitOrder } = this.props;
    const newOrder = habitOrder.filter(habitKey => habitKey !== activeHabit);
    await removeHabit(activeHabit);
    await updateHabitOrder(newOrder);
    this.closeHabitModal();
  };

  onNewHabit = async () => {
    const { createHabit } = this.props;
    const { startingDate } = this.state;
    const habitKey = generatePushID();
    await createHabit(startingDate, habitKey);
    this.openHabitModal(habitKey);
  };

  handleNewWeekSelection = startingDate => {
    this.setState({
      startingDate,
    });
    this.props.formatWeek(startingDate);
  };

  updateFocusedHabitKey = key => {
    this.setState({
      updateKey: key,
    });
  };

  saveHabit = () => {
    const { activeHabit, habitName, habitGoal } = this.state;
    this.props.saveHabit(activeHabit, habitName, habitGoal);
    this.updateFocusedHabitKey(activeHabit);
    this.closeHabitModal();
  };

  openItemModal = (itemKey, habitKey, notes, startingDate, rowID) => {
    this.setState({
      itemModalVisible: true,
      itemNotes: notes,
      activeItem: itemKey,
      activeHabit: habitKey,
      startingDate,
      activeRowID: rowID,
      scrollHabits: true,
    });
  };

  openHabitModal = (key, name = "", goal = 0) => {
    this.setState({
      habitModalVisible: true,
      habitName: name,
      activeHabit: key,
      habitGoal: goal,
    });
  };

  openHabitCustomisationModal = () => {
    this.setState({
      habitModalVisible: false,
      habitCustomisationModalVisible: true,
    });
  };

  closeItemModal = () => {
    this.setState({ itemModalVisible: false });
  };

  closeHabitModal = () => {
    this.setState({ habitModalVisible: false });
  };

  closeHabitCustomisationModal = () => {
    this.setState({
      habitModalVisible: true,
      habitCustomisationModalVisible: false,
    });
  };

  handleChange = (text, target) => {
    this.setState({
      ...this.state,
      [target]: text,
    });
  };

  reorderRows = async move => {
    this.enableHabitListScroll();
    const { reorderHabits, habits } = this.props;
    const prevOrder = habits.map(h => h.key);
    this.setState({ activeRow: move.to });
    await reorderHabits(prevOrder, move.from, move.to, move.row.data.key);
    this.forceUpdate();
  };

  returnOrderedHabits = () => {
    const { habits, habitOrder } = this.props;

    const habitsOrdered =
      habitOrder.length < 1
        ? habits
        : habitOrder.map(hid => habits.find(h => h.key === hid)).filter(h => h !== undefined);

    return habitsOrdered;
  };

  enableHabitListScroll = () => {
    this.setState({ scrollHabits: true });
  };

  disableHabitListScroll = () => {
    this.setState({ scrollHabits: false });
  };

  saveItem = () => {
    const { activeItem, activeHabit, notes, startingDate, activeRowID } = this.state;
    this.props.saveHabitItemNotes(activeItem, activeHabit, notes, startingDate, activeRowID);
    this.updateFocusedHabitKey(activeHabit);
    this.closeItemModal();
  };

  clearItem = () => {
    const { activeItem, activeHabit, startingDate, activeRowID } = this.state;
    this.props.clearHabitItem(activeItem, activeHabit, startingDate, activeRowID);
    this.closeItemModal();
  };

  renderNewHabitButton = () => {
    // Renders button animation downwards if no habits exist, aesthetical fix
    const direction = this.props.habits.length < 1 ? "down" : "up";
    return <RoundButton onPress={this.onNewHabit} title="New Habit" size={60} direction={direction} />;
  };

  renderRow = (row, layout, rowIndex) => {
    return (
      <TouchableHighlight underlayColor={null}>
        <View>
          <Row
            data={row}
            toggleItemStatus={this.props.toggleHabitItemStatus}
            openItemModal={this.openItemModal}
            openHabitModal={this.openHabitModal}
            startingDate={this.state.startingDate}
            saveHabit={this.props.saveHabit}
            updateFocusedHabitKey={this.updateFocusedHabitKey}
            updateKey={this.state.updateKey}
            active={rowIndex === this.state.activeRow}
            disableAnimatedScrolling
          />
        </View>
      </TouchableHighlight>
    );
  };

  render() {
    return (
      <Container style={{ backgroundColor: "white" }}>
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
              ref={calendar => {
                this.calendar = calendar;
              }}
              updateWeek={false}
              daySelectionAnimation={{
                type: "border",
                duration: 100,
                borderWidth: 1,
                borderHighlightColor: "rgba(0,0,0,0.8)",
              }}
              style={{ height: 100, paddingTop: 20, paddingBottom: 15 }}
              calendarHeaderStyle={{ paddingBottom: 15 }}
              highlightDateNumberStyle={{ textDecorationLine: "underline" }}
              iconContainer={{ width: 40 }}
              styleWeekend={false}
              onWeekChanged={this.handleNewWeekSelection}
              onToday={() => this.props.formatWeek(moment())}
            />
          </GestureRecognizer>
        </View>
        <SortableListView
          style={styles.list}
          data={this.returnOrderedHabits()}
          limitScrolling
          removeClippedSubviews={false}
          onRowActive={this.disableHabitListScroll}
          onMoveStart={this.activateRow}
          onMoveEnd={this.enableHabitListScroll}
          onRowMoved={this.reorderRows}
          renderRow={this.renderRow}
          renderFooter={this.renderNewHabitButton}
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
        />
      </Container>
    );
  }
}

Habits.propTypes = {
  formatWeek: PropTypes.func.isRequired,
  saveHabit: PropTypes.func.isRequired,
  habitOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  toggleHabitItemStatus: PropTypes.func.isRequired,
  saveHabitItemNotes: PropTypes.func.isRequired,
  reorderHabits: PropTypes.func.isRequired,
  fetchHabits: PropTypes.func.isRequired,
  removeHabit: PropTypes.func.isRequired,
  createHabit: PropTypes.func.isRequired,
  clearHabitItem: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  button: {
    borderColor: "#000066",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    flex: 1,
    marginTop: 10,
  },
});

export default Habits;
