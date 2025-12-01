import { NavigationProp } from "@react-navigation/native";
import { Container, Content } from "../../../ui";
import React, { FC, useContext, useEffect, useState } from "react";
import FirebaseContext from "../../../config/remote/firebaseContext";
import SyncContext from "../../../config/remote/syncContext";
import { AnonymousView } from "./AnonymousView";
import { AuthenticatedView } from "./AuthenticatedView";
import { styles } from "./ProfileScreen.styles";

interface Props {
  navigation: NavigationProp<any>;
}

export const ProfileScreen: FC<Props> = ({ navigation }) => {
  const { auth } = useContext(FirebaseContext);
  const { syncAll } = useContext(SyncContext);
  const [loggedIn, setLoggedIn] = useState<boolean>(!!auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      const isLoggedIn = !!user;
      setLoggedIn(isLoggedIn);
      if (isLoggedIn) syncAll();
    });
    return unsubscribe;
  }, [auth, syncAll]);

  return (
    <Container>
      <Content contentContainerStyle={styles.content}>
        {loggedIn ? <AuthenticatedView navigation={navigation} /> : <AnonymousView navigation={navigation} />}
      </Content>
    </Container>
  );
};

export default ProfileScreen;
