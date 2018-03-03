import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getHabits, getWeek, setError, removeHabit, createHabit, saveHabit, toggleHabitItemStatus, saveHabitItemNotes, clearHabitItem } from '../actions/habits';
import moment from 'moment';

class RecipeListing extends Component {
  static propTypes = {
    Layout: PropTypes.func.isRequired,
    habits: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      error: PropTypes.string,
      habitCreatedKey: PropTypes.string,
      habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({}),
    }),
    getHabits: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    toggleHabitItemStatus: PropTypes.func.isRequired,
    saveHabitItemNotes: PropTypes.func.isRequired,
    clearHabitItem: PropTypes.func.isRequired,
  }

  static defaultProps = {
    match: null,
  }

  componentDidMount = () => this.fetchHabits(true);

  /**
    * Fetch Data from API, saving to Redux
    */
  fetchHabits = (reFetch = false) => {
    if (reFetch || this.props.habits.habits[0].placeholder) {
      return this.props.getWeek(moment())
      .then(()=> this.props.getHabits())
      .catch((err) => {
        console.log(`Error: ${err}`);
        return this.props.setError(err);
      });
    }
    return false;
  }

  render = () => {
    const { Layout, habits, match, createHabit, removeHabit, saveHabit, clearHabitItem, toggleHabitItemStatus, saveHabitItemNotes, getHabits, getWeek} = this.props;
    return (
      <Layout
        error={habits.error}
        loading={habits.loading}
        habits={habits.habits}
        saveHabitItemNotes={saveHabitItemNotes}
        toggleHabitItemStatus={toggleHabitItemStatus}
        clearHabitItem={clearHabitItem}
        saveHabit={saveHabit}
        createHabit={createHabit}
        removeHabit={removeHabit}
        habitCreatedKey={habits.habitCreatedKey}
        getWeek={getWeek}
      />
    );
  }
}

const mapStateToProps = state => ({
  habits: state.habits || {}
});

const mapDispatchToProps = {
  getHabits,
  getWeek,
  removeHabit,
  setError,
  createHabit,
  toggleHabitItemStatus,
  saveHabitItemNotes,
  clearHabitItem,
  saveHabit,
};

export default connect(mapStateToProps, mapDispatchToProps)(RecipeListing);
