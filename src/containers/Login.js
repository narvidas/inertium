import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { login } from '../actions/member';
import { getHabits, getHabitOrder, formatWeek } from '../actions/habits';
import LoginComponent from '../components/profile/Login';

const Login = ({
  login,
  getHabits,
  getHabitOrder,
  formatWeek,
  member,
  isLoading,
  infoMessage,
  errorMessage,
  successMessage,
}) => {
  /**
   * Fetch Data from API if logged in, then format weekly view
   */
  const loginAndFetchHabits = async (email, password) => {
    const today = moment();
    await login(email, password);
    await getHabits();
    await getHabitOrder();
    formatWeek(today);
  };

  return (
    <LoginComponent
      member={member}
      loading={isLoading}
      info={infoMessage}
      error={errorMessage}
      success={successMessage}
      onFormSubmit={loginAndFetchHabits}
    />
  );
};

Login.propTypes = {
  member: PropTypes.shape({}).isRequired,
  login: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  infoMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
};

Login.defaultProps = {
  infoMessage: null,
  errorMessage: null,
  successMessage: null,
};

const mapStateToProps = (state) => ({
  member: state.member || {},
  isLoading: state.status.loading || false,
  infoMessage: state.status.info || null,
  errorMessage: state.status.error || null,
  successMessage: state.status.success || null,
});

const mapDispatchToProps = {
  login,
  getHabits,
  getHabitOrder,
  formatWeek,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
