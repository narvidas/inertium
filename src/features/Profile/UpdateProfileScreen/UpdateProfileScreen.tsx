import { Formik } from "formik";
import {
  Body,
  Button,
  CheckBox,
  Container,
  Content,
  Form,
  Input,
  Item,
  Label,
  ListItem,
  Text,
  View,
} from "../../../ui";
import React, { FC, useContext, useEffect, useState } from "react";
import * as Yup from "yup";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import { Spacer } from "../../../components/Spacer";
import FirebaseContext from "../../../config/remote/firebaseContext";
import { errorToast, successToast } from "../../../utils/toast";
import { styles } from "./UpdateProfileScreen.styles";

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const UpdateProfileScreen: FC = () => {
  const { db, auth } = useContext(FirebaseContext);
  const uid = auth.currentUser?.uid;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string>();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user profile when uid is available
  useEffect(() => {
    if (!uid) {
      setLoadingUser(false);
      return;
    }

    const userRef = db.ref(`users/${uid}`);
    const unsubscribe = userRef.on("value", (snapshot) => {
      setCurrentUser(snapshot.val());
      setLoadingUser(false);
    });

    return () => userRef.off("value", unsubscribe);
  }, [db, uid]);

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  const updateProfile = async values => {
    if (!uid) return;
    setError(undefined);
    setLoading(true);
    const { firstName, lastName, email, password, password2 } = values;
    try {
      if (showChangePassword && password !== password2) throw Error("Passwords do not match!");
      await db.ref(`users/${uid}`).update({ firstName, lastName });
      if (showChangeEmail) {
        await db.ref(`users/${uid}`).update({ email });
        await auth.currentUser?.updateEmail(email);
      }
      if (showChangePassword) await auth.currentUser?.updatePassword(password);
      successToast("Updated successfully");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    changePassword: Yup.boolean(),
    changeEmail: Yup.boolean(),
    email: Yup.string().when("changeEmail", {
      is: true,
      then: Yup.string()
        .email("E-mail is not valid!")
        .required("E-mail is required!"),
      otherwise: Yup.string(),
    }),
    password: Yup.string().when("changePassword", {
      is: true,
      then: Yup.string()
        .min(6, "Password has to be longer than 6 characters!")
        .required("Password is required!"),
      otherwise: Yup.string(),
    }),
    password2: Yup.string().when("changePassword", {
      is: true,
      then: Yup.string()
        .min(6, "Password has to be longer than 6 characters!")
        .required("Password is required!"),
      otherwise: Yup.string(),
    }),
  });

  const updateError = errors => {
    if (errors) {
      const errorMessages = Object.values(errors);
      const errorMessagesExist = errorMessages.length > 0;
      if (errorMessagesExist) setError(errorMessages[0]);
    }
  };

  if (!uid || loadingUser) return <Loading />;
  const { firstName = "", lastName = "", email = "" } = currentUser || {};

  return (
    <Container>
      <Content contentContainerStyle={styles.content}>
        <Header title="Update Profile" content="You can update your account details below." />
        {(loading || loadingUser) && <Loading />}
        <Formik
          validationSchema={validationSchema}
          onSubmit={updateProfile}
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={{
            firstName,
            lastName,
            email,
            changePassword: false,
            changeEmail: false,
            password: "",
            password2: "",
          }}
          render={({ handleChange, handleSubmit, errors }) => (
            <>
              {updateError(errors)}
              <Form>
                <Item stackedLabel>
                  <Label>First Name</Label>
                  <Input defaultValue={firstName} onChangeText={handleChange("firstName")} />
                </Item>

                <Item stackedLabel>
                  <Label>Last Name</Label>
                  <Input defaultValue={lastName} onChangeText={handleChange("lastName")} />
                </Item>

                <ListItem>
                  <CheckBox
                    onPress={value => {
                      setShowChangeEmail(!showChangeEmail);
                      handleChange("changeEmail")(value);
                    }}
                    checked={showChangeEmail}
                    name="changeEmail"
                  />
                  <Body>
                    <Text>Change Email</Text>
                  </Body>
                </ListItem>

                {showChangeEmail && (
                  <Item stackedLabel>
                    <Label>Email</Label>
                    <Input
                      defaultValue={email}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={handleChange("email")}
                    />
                  </Item>
                )}

                <ListItem>
                  <CheckBox
                    onPress={value => {
                      setShowChangePassword(!showChangePassword);
                      handleChange("changePassword")(value);
                    }}
                    checked={showChangePassword}
                    name="changePassword"
                  />
                  <Body>
                    <Text>Change Password</Text>
                  </Body>
                </ListItem>

                {showChangePassword && (
                  <View padder>
                    <Item stackedLabel>
                      <Label>Password</Label>
                      <Input secureTextEntry onChangeText={handleChange("password")} />
                    </Item>

                    <Item stackedLabel last>
                      <Label>Confirm Password</Label>
                      <Input secureTextEntry onChangeText={handleChange("password2")} />
                    </Item>
                  </View>
                )}

                <Spacer size={20} />

                <Button success block onPress={handleSubmit}>
                  <Text>Update Profile</Text>
                </Button>

                <Spacer size={40} />
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
                  <Button
                    small
                    danger
                    onPress={() => {
                      /* TODO delete account*/
                    }}
                  >
                    <Text>Delete Account</Text>
                  </Button>
                </View>
              </Form>
            </>
          )}
        />
      </Content>
    </Container>
  );
};

export default UpdateProfileScreen;
