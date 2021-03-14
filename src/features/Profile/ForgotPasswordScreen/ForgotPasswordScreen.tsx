import { Formik } from "formik";
import { Button, Container, Content, Form, Input, Item, Label, Text } from "native-base";
import React, { FC, useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import { Spacer } from "../../../components/Spacer";
import FirebaseContext from "../../../config/remote/firebaseContext";
import { errorToast } from "../../../utils/toast";
import { styles } from "./ForgotPasswordScreen.styles";

export const ForgotPasswordScreen: FC = () => {
  const [error, setError] = useState<string>();
  const { auth } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  const resetPassword = async values => {
    setLoading(true);
    try {
      await auth.sendPasswordResetEmail(values.email);
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
      <Content contentContainerStyle={styles.content}>
        <Header title="Welcome back" content="Please use your email and password to login." />
        {loading && <Loading />}
        <Formik
          validationSchema={validationSchema}
          onSubmit={resetPassword}
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={{ email: "" }}
          render={({ handleChange, handleSubmit, errors }) => (
            <>
              {updateError(errors)}
              <Form>
                <Item stackedLabel>
                  <Label>Email</Label>
                  <Input
                    autoCapitalize="none"
                    name="email"
                    keyboardType="email-address"
                    onChangeText={handleChange("email")}
                  />
                </Item>

                <Spacer size={20} />

                <Button block onPress={handleSubmit}>
                  <Text>Reset Password</Text>
                </Button>
              </Form>
            </>
          )}
        />
      </Content>
    </Container>
  );
};
