import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { Body, Left, List, ListItem, Text, View } from "../../../ui";
import React, { FC, useContext } from "react";
import { useObjectVal } from "react-firebase-hooks/database";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import FirebaseContext from "../../../config/remote/firebaseContext";

interface Props {
  navigation: NavigationProp<any>;
}

export const AuthenticatedView: FC<Props> = ({ navigation }) => {
  const { db, auth } = useContext(FirebaseContext);
  const uid = (auth.currentUser && auth.currentUser.uid) || "";
  const currentUserDbRef = db.ref(`users/${uid}`);
  const [currentUser, loadingUser] = useObjectVal(currentUserDbRef);

  const logout = () => {
    auth.signOut();
    navigation.navigate("Profile");
  };

  if (loadingUser) return <Loading />;
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
