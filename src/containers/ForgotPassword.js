import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { resetPassword } from '../actions/member';
import ForgotPasswordComponent from '../components/profile/ForgotPassword';

const ForgotPassword = ({ onFormSubmit, member, isLoading, errorMessage }) => (
  <ForgotPasswordComponent member={member} loading={isLoading} error={errorMessage} onFormSubmit={onFormSubmit} />
);

ForgotPassword.propTypes = {
  member: PropTypes.shape({}).isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

ForgotPassword.defaultProps = {
  errorMessage: null,
};

const mapStateToProps = (state) => ({
  member: state.member || {},
  isLoading: state.status.loading || false,
  infoMessage: state.status.info || null,
  errorMessage: state.status.error || null,
  successMessage: state.status.success || null,
});

const mapDispatchToProps = {
  onFormSubmit: resetPassword,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgotPassword);
