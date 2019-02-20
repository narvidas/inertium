import React from 'react';
import PropTypes from 'prop-types';
import { Container, Content, Text, Form, Item, Label, Input, Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Loading from '../common/Loading';
import Messages from '../common/Messages';
import Header from '../common/Header';
import Spacer from '../common/Spacer';

class ForgotPassword extends React.Component {
  static propTypes = {
    member: PropTypes.shape({
      email: PropTypes.string,
    }),
    error: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    onFormSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    error: null,
    member: {},
  };

  state = {
    email: this.props.member && this.props.member.email ? this.props.member.email : '',
  };

  handleChange = (name, val) => {
    this.setState({
      ...this.state,
      [name]: val,
    });
  };

  handleSubmit = async () => {
    await this.props.onFormSubmit(this.state);
    await Actions.login();
  };

  render() {
    const { loading, error } = this.props;

    // Loading
    if (loading) return <Loading />;

    return (
      <Container>
        <Content padder>
          <Header title="Reset your Password" content="No stress, no stress. We'll get you back into your account." />

          {error && <Messages message={error} />}

          <Form>
            <Item stackedLabel>
              <Label>Email</Label>
              <Input
                autoCapitalize="none"
                value={this.state.email}
                keyboardType="email-address"
                onChangeText={(v) => this.handleChange('email', v)}
              />
            </Item>

            <Spacer size={20} />

            <Button block onPress={this.handleSubmit}>
              <Text>Reset Password</Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}

export default ForgotPassword;
