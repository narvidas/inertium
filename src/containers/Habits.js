import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  getHabits,
  getHabitOrder,
  formatWeek,
  setError,
  removeHabit,
  reorderHabits,
  createHabit,
  saveHabit,
  toggleHabitItemStatus,
  saveHabitItemNotes,
  clearHabitItem,
} from '../actions/habits';
import HabitsComponent from '../components/habits';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';

class Habits extends Component {
  static propTypes = {
    habits: PropTypes.shape({
      order: PropTypes.array,
      week: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
    getHabits: PropTypes.func.isRequired,
    toggleHabitItemStatus: PropTypes.func.isRequired,
    saveHabitItemNotes: PropTypes.func.isRequired,
    clearHabitItem: PropTypes.func.isRequired,
    reorderHabits: PropTypes.func.isRequired,
    auth: PropTypes.bool,
  };

  static defaultProps = {
    auth: false,
  };

  componentDidMount = () => {
    this.fetchHabits();
  };

  /**
   * Fetch Data from API if logged in, then format weekly view
   */
  fetchHabits = async (date = moment()) => {
    const { getHabits, getHabitOrder, formatWeek } = this.props;

    await getHabits();
    await getHabitOrder();
    formatWeek(date);
  };

  render = () => {
    const {
      habits,
      createHabit,
      reorderHabits,
      removeHabit,
      saveHabit,
      clearHabitItem,
      toggleHabitItemStatus,
      saveHabitItemNotes,
      loading,
      error,
      formatWeek,
    } = this.props;

    if (loading) return <Loading />;
    if (error) return <Error content={error} />;

    return (
      <HabitsComponent
        habits={habits.week}
        saveHabitItemNotes={saveHabitItemNotes}
        toggleHabitItemStatus={toggleHabitItemStatus}
        clearHabitItem={clearHabitItem}
        saveHabit={saveHabit}
        reorderHabits={reorderHabits}
        createHabit={createHabit}
        removeHabit={removeHabit}
        habitOrder={habits.order}
        fetchHabits={this.fetchHabits}
        formatWeek={formatWeek}
      />
    );
  };
}

const mapStateToProps = (state) => ({
  habits: state.habits || {},
  auth: state.member.auth,
  loading: state.status.loading,
});

const mapDispatchToProps = {
  getHabits,
  getHabitOrder,
  formatWeek,
  reorderHabits,
  removeHabit,
  setError,
  createHabit,
  toggleHabitItemStatus,
  saveHabitItemNotes,
  clearHabitItem,
  saveHabit,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Habits);
