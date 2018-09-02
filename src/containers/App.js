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
      habitCreatedKey: PropTypes.string,
      habitOrder: PropTypes.array,
      habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
      // habitsraw: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
  memberLogout: PropTypes.func.isRequired,
  member: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  member: state.member || {},
  habits: state.habits || {}, 
});

const mapDispatchToProps = {
  memberLogout: logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
