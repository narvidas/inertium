import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import { Container, Content, Card, CardItem, Body, H3, List, ListItem, Text } from 'native-base';
import ErrorMessages from '../../constants/errors';
import Error from './Error';
import Spacer from './Spacer';

const HabitView = () => {
  // Error
  if (error) return <Error content={error} />;
  return (<div></div>);
};

HabitView.propTypes = {
  error: PropTypes.string,
};

HabitView.defaultProps = {
  error: null,
};

export default HabitView;