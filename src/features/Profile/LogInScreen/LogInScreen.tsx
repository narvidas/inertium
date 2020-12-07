import { NavigationProp } from "@react-navigation/native";
import { Formik } from "formik";
import { Button, Container, Content, Form, Input, Item, Label, Root, Text, View } from "native-base";
import React, { FC, useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { Header } from "../../../components/Header/Header";
import { Loading } from "../../../components/Loading/Loading";
import { Spacer } from "../../../components/Spacer/Spacer";
import FirebaseContext from "../../../config/firebaseContext";
import { errorToast } from "../../../utils/toast";
import { styles } from "./LogInScreen.styles";

interface Props {
  navigation: NavigationProp<any>;
}

export const LogInScreen: FC<Props> = ({ navigation }) => {
  const [error, setError] = useState<string>();
  const { auth, updateStoredCurrentUser } = useContext(FirebaseContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  const login = async values => {
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(values.email, values.password);
      updateStoredCurrentUser();
      navigation.navigate("Profile");
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
    <Root>
      <Container>
        <Content contentContainerStyle={styles.content}>
          <View>
            <Header title="Welcome back" content="Please use your email and password to login." />
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
          </View>
        </Content>
      </Container>
    </Root>
  );
};
