import { Formik } from "formik";
import { Button, Container, Content, Form, Input, Item, Label, Text } from "native-base";
import React, { useContext, useState } from "react";
import { Actions } from "react-native-router-flux";
import * as Yup from "yup";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import Messages from "../../components/Messages";
import Spacer from "../../components/Spacer";
import FirebaseContext from "../../config/firebaseContext";

export const LogInScreen = () => {
  const [error, setError] = useState();
  const { auth } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(false);

  const login = async values => {
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(values.email, values.password);
      Actions.profileHome();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("E-mail is not valid!")
      .required("E-mail is required!"),
    password: Yup.string()
      .min(6, "Password has to be longer than 6 characters!")
      .required("Password is required!"),
  });

  const updateError = errors => {
    if (errors) {
      const errorMessages = Object.values(errors);
      const errorMessagesExist = errorMessages.length > 0;
      if (errorMessagesExist) setError(errorMessages[0]);
    }
  };

  return (
    <Container>
      <Content padder>
        <Header title="Welcome back" content="Please use your email and password to login." />
        {error && <Messages message={error} />}
        {loading && <Loading />}
        <Formik
          validationSchema={validationSchema}
          onSubmit={login}
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={{ email: "", password: "" }}
          render={({ handleChange, handleSubmit, errors }) => (
            <>
              {updateError(errors)}
              <Form>
                <Item stackedLabel>
                  <Label>Email</Label>
                  <Input autoCapitalize="none" keyboardType="email-address" onChangeText={handleChange("email")} />
                </Item>
                <Item stackedLabel>
                  <Label>Password</Label>
                  <Input secureTextEntry onChangeText={handleChange("password")} />
                </Item>

                <Spacer size={20} />

                <Button block onPress={handleSubmit}>
                  <Text>Login</Text>
                </Button>
              </Form>
            </>
          )}
        />
      </Content>
    </Container>
  );
};

export default LogInScreen;
