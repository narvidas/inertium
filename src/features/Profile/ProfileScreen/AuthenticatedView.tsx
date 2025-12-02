import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { Body, Left, List, ListItem, Text, View } from "../../../ui";
import React, { FC, useContext, useEffect, useState } from "react";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import FirebaseContext from "../../../config/remote/firebaseContext";

interface Props {
  navigation: NavigationProp<any>;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const AuthenticatedView: FC<Props> = ({ navigation }) => {
  const { db, auth } = useContext(FirebaseContext);
  const uid = auth.currentUser?.uid;
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile when uid is available
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const userRef = db.ref(`users/${uid}`);
    const unsubscribe = userRef.on("value", (snapshot) => {
      setCurrentUser(snapshot.val());
      setLoading(false);
    });

    return () => userRef.off("value", unsubscribe);
  }, [db, uid]);

  const logout = () => {
    auth.signOut();
    navigation.navigate("Profile");
  };

  // Show loading while fetching user data
  if (!uid || loading) return <Loading />;
  return (
    <View style={{ flex: 1 }}>
      <Header
        title={`Hi ${currentUser?.firstName},`}
        content={`You are currently logged in as ${currentUser?.email}`}
      />
      <List>
        <ListItem onPress={() => navigation.navigate("Update Profile")} icon>
          <Left>
            <Ionicons name="person-add-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>Update My Profile</Text>
          </Body>
        </ListItem>
        <ListItem onPress={logout} icon>
          <Left>
            <Ionicons name="power-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>Logout</Text>
          </Body>
        </ListItem>
      </List>
    </View>
  );
};
