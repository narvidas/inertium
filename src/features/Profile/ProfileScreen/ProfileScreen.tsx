import { NavigationProp } from "@react-navigation/native";
import { Container, Content } from "native-base";
import React, { FC, useContext, useState } from "react";
import FirebaseContext from "../../../config/firebaseContext";
import { sync } from "../../Habits/habit.sync";
import { AnonymousView } from "./AnonymousView";
import { AuthenticatedView } from "./AuthenticatedView";
import { styles } from "./ProfileScreen.styles";

interface Props {
  navigation: NavigationProp<any>;
}

export const ProfileScreen: FC<Props> = ({ navigation }) => {
  const { auth } = useContext(FirebaseContext);
  const [loggedIn, setLoggedIn] = useState<boolean>(!!auth.currentUser);

  auth.onAuthStateChanged(user => {
    const loggedIn = !!user;
    setLoggedIn(loggedIn);
    if (loggedIn) sync.syncAll();
  });

  return (
    <Container>
      <Content contentContainerStyle={styles.content}>
        {loggedIn ? <AuthenticatedView navigation={navigation} /> : <AnonymousView navigation={navigation} />}
      </Content>
    </Container>
  );
};

export default ProfileScreen;
