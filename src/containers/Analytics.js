import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Analytics extends Component {
  static propTypes = {
    Layout: PropTypes.func.isRequired,
    habits: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      error: PropTypes.string,
      habitCreatedKey: PropTypes.string,
      habitOrder: PropTypes.array,
      habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({}),
    }),
  }

  static defaultProps = {
    match: null,
  }

  render = () => {
    const { Layout, habits, match, createHabit, reorderHabits, removeHabit, saveHabit, clearHabitItem, toggleHabitItemStatus, saveHabitItemNotes, getHabits, getWeek} = this.props;
    return (
      <Layout
        error={habits.error}
        loading={habits.loading}
        habits={habits.habits}
      />
    );
  }
}

const mapStateToProps = state => ({
  habits: state.habits || {}
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Analytics);
