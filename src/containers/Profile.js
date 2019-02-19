import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logout } from '../actions/member';
import ProfileComponent from '../components/profile/Profile';

const Profile = ({ member, memberLogout, habits }) => (
  <ProfileComponent member={member} logout={memberLogout} habits={habits.week} />
);

Profile.propTypes = {
  habits: PropTypes.shape({
    order: PropTypes.array,
    week: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
  memberLogout: PropTypes.func.isRequired,
  member: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (state) => ({
  member: state.member || {},
  habits: state.habits || {},
});

const mapDispatchToProps = {
  memberLogout: logout,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
