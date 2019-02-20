import React from 'react';
import PropTypes from 'prop-types';
import { Container, Content, Text, Form, Item, Label, Input, Button } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Loading from '../common/Loading';
import Messages from '../common/Messages';
import Header from '../common/Header';
import Spacer from '../common/Spacer';

class SignUp extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    onFormSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    error: null,
  };

  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password2: '',
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
          <Header
            title="Welcome"
            content="We're glad to welcome you to the community. There's only a few questions and you'll be on your way."
          />

          {error && <Messages message={error} />}

          <Form>
            <Item stackedLabel>
              <Label>First Name</Label>
              <Input onChangeText={(v) => this.handleChange('firstName', v)} />
            </Item>

            <Item stackedLabel>
              <Label>Last Name</Label>
              <Input onChangeText={(v) => this.handleChange('lastName', v)} />
            </Item>

            <Item stackedLabel>
              <Label>Email</Label>
              <Input
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(v) => this.handleChange('email', v)}
              />
            </Item>

            <Item stackedLabel>
              <Label>Password</Label>
              <Input secureTextEntry onChangeText={(v) => this.handleChange('password', v)} />
            </Item>

            <Item stackedLabel>
              <Label>Confirm Password</Label>
              <Input secureTextEntry onChangeText={(v) => this.handleChange('password2', v)} />
            </Item>

            <Spacer size={20} />

            <Button block onPress={this.handleSubmit}>
              <Text>Sign Up</Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}

export default SignUp;
