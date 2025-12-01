import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { Body, Left, List, ListItem, Right, Text, View, CheckBox } from "../../../ui";
import React, { FC, useContext } from "react";
import { useObjectVal } from "react-firebase-hooks/database";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import FirebaseContext from "../../../config/remote/firebaseContext";
import { toggleScrollableView, useScrollableViewSelector } from "../../../config/rtk/settings.slice";

interface Props {
  navigation: NavigationProp<any>;
}

export const AuthenticatedView: FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { db, auth } = useContext(FirebaseContext);
  const uid = (auth.currentUser && auth.currentUser.uid) || "";
  const currentUserDbRef = db.ref(`users/${uid}`);
  const [currentUser, loadingUser] = useObjectVal(currentUserDbRef);
  const useScrollableView = useSelector(useScrollableViewSelector);

  const logout = () => {
    auth.signOut();
    navigation.navigate("Profile");
  };

  const handleToggleScrollableView = () => {
    dispatch(toggleScrollableView());
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
        <ListItem onPress={handleToggleScrollableView} icon>
          <Left>
            <Ionicons name="swap-horizontal-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>Scrollable Habits View</Text>
          </Body>
          <Right>
            <CheckBox checked={useScrollableView} onPress={handleToggleScrollableView} />
          </Right>
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
