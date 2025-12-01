import { NavigationProp } from "@react-navigation/native";
import { Formik } from "formik";
import { Button, Container, Content, Form, Input, Item, Label, Root, Text } from "../../../ui";
import React, { FC, useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { Header } from "../../../components/Header/Header";
import { Loading } from "../../../components/Loading/Loading";
import { Spacer } from "../../../components/Spacer/Spacer";
import FirebaseContext from "../../../config/remote/firebaseContext";
import { errorToast } from "../../../utils/toast";
import { styles } from "./SignUpScreen.styles";

interface Props {
  navigation: NavigationProp<any>;
}

export const SignUpScreen: FC<Props> = ({ navigation }) => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { auth, db } = useContext(FirebaseContext);

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  const register = async values => {
    const { firstName, lastName, email, password, password2 } = values;
    setLoading(true);
    try {
      if (password !== password2) throw Error("Passwords do not match. Please try again.");
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      await db.ref(`users/${uid}`).set({
        firstName,
        lastName,
        email,
      });
      navigation.navigate("Profile");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const updateError = errors => {
    if (errors) {
      const errorMessages = Object.values(errors);
      const errorMessagesExist = errorMessages.length > 0;
      if (errorMessagesExist) setError(errorMessages[0]);
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("E-mail is not valid!")
      .required("E-mail is required!"),
    password: Yup.string()
      .min(6, "Password has to be longer than 6 characters!")
      .required("Password is required!"),
    password2: Yup.string()
      .min(6, "Password has to be longer than 6 characters!")
      .required("Password is required!"),
  });

  return (
    <Root>
      <Container>
        <Content contentContainerStyle={styles.content}>
          <Header title="Welcome" content="Please fill in the form to sign-up." />
          {loading && <Loading />}
          <Formik
            validationSchema={validationSchema}
            onSubmit={register}
            validateOnChange={false}
            validateOnBlur={false}
            initialValues={{ firstName: "", lastName: "", email: "", password: "", password2: "" }}
            render={({ handleChange, handleSubmit, errors }) => (
              <>
                {updateError(errors)}
                <Form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <Item stackedLabel>
                    <Label>First Name</Label>
                    <Input onChangeText={handleChange("firstName")} name="firstName" />
                  </Item>

                  <Item stackedLabel>
                    <Label>Last Name</Label>
                    <Input onChangeText={handleChange("lastName")} name="lastName" />
                  </Item>

                  <Item stackedLabel>
                    <Label>Email</Label>
                    <Input
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={handleChange("email")}
                      name="email"
                    />
                  </Item>

                  <Item stackedLabel>
                    <Label>Password</Label>
                    <Input secureTextEntry onChangeText={handleChange("password")} name="password" />
                  </Item>

                  <Item stackedLabel>
                    <Label>Confirm Password</Label>
                    <Input secureTextEntry onChangeText={handleChange("password2")} name="password2" />
                  </Item>

                  <Spacer size={40} />

                  <Button block onPress={handleSubmit}>
                    <Text>Register</Text>
                  </Button>
                </Form>
              </>
            )}
          />
        </Content>
      </Container>
    </Root>
  );
};
