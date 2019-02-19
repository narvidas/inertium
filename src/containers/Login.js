import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { login } from '../actions/member';
import LoginComponent from '../components/profile/Login';

const Login = ({ onFormSubmit, member, isLoading, infoMessage, errorMessage, successMessage }) => (
  <LoginComponent
    member={member}
    loading={isLoading}
    info={infoMessage}
    error={errorMessage}
    success={successMessage}
    onFormSubmit={onFormSubmit}
  />
);

Login.propTypes = {
  member: PropTypes.shape({}).isRequired,
  onFormSubmit: PropTypes.func.isRequired,
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
  onFormSubmit: login,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
