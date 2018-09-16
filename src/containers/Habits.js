import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { getHabits, formatWeek, setError, removeHabit, reorderHabits, createHabit, saveHabit, toggleHabitItemStatus, saveHabitItemNotes, clearHabitItem } from '../actions/habits';

class HabitListing extends Component {
  static propTypes = {
    Layout: PropTypes.func.isRequired,
    habits: PropTypes.shape({
      habitCreatedKey: PropTypes.string,
      habitOrder: PropTypes.array,
      habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
    getHabits: PropTypes.func.isRequired,
    toggleHabitItemStatus: PropTypes.func.isRequired,
    saveHabitItemNotes: PropTypes.func.isRequired,
    clearHabitItem: PropTypes.func.isRequired,
    reorderHabits: PropTypes.func.isRequired,
    auth: PropTypes.bool,
  }

  static defaultProps = {
    auth: false,
  }

  componentDidMount = () => {
    this.fetchHabits();
  }

  /**
    * Fetch Data from API if logged in, then format weekly view
    */
  fetchHabits = async (date = moment()) => {
    const { auth, getHabits, formatWeek } = this.props;

    if (auth) await getHabits(date);
    await formatWeek(date);
  }

  render = () => {
    const { Layout, habits, createHabit, reorderHabits, removeHabit, saveHabit, clearHabitItem, toggleHabitItemStatus, saveHabitItemNotes, loading, formatWeek} = this.props;

    return (
      <Layout
        error={habits.error}
        loading={loading}
        habits={habits.habits}
        saveHabitItemNotes={saveHabitItemNotes}
        toggleHabitItemStatus={toggleHabitItemStatus}
        clearHabitItem={clearHabitItem}
        saveHabit={saveHabit}
        reorderHabits={reorderHabits}
        createHabit={createHabit}
        removeHabit={removeHabit}
        habitCreatedKey={habits.habitCreatedKey}
        habitOrder={habits.habitOrder}
        fetchHabits={this.fetchHabits}
        formatWeek={formatWeek}
      />
    );
  }
}

const mapStateToProps = state => ({
  habits: state.habits || {},
  auth: state.member.auth,
  loading: state.status.loading,
});

const mapDispatchToProps = {
  getHabits,
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

export default connect(mapStateToProps, mapDispatchToProps)(HabitListing);
