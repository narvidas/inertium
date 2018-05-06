import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { logout } from '../actions/member';

const App = ({ Layout, member, memberLogout, habits }) => (
  <Layout member={member} logout={memberLogout} habits={habits.habits}/>
);

App.propTypes = {
  Layout: PropTypes.func.isRequired,
  habits: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      error: PropTypes.string,
      habitCreatedKey: PropTypes.string,
      habitOrder: PropTypes.array,
      habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
  memberLogout: PropTypes.func.isRequired,
  member: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = state => ({
  member: state.member || {},
  habits: state.habits || {}
});

const mapDispatchToProps = {
  memberLogout: logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
