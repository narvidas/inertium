import { Body, Container, Content, Icon, Left, List, ListItem, Text } from "native-base";
import React, { useContext } from "react";
import { useObjectVal } from "react-firebase-hooks/database";
import { View } from "react-native";
import { Actions } from "react-native-router-flux";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import FirebaseContext from "../../config/firebaseContext";

export const ProfileScreen = () => {
  const { db, auth } = useContext(FirebaseContext);
  const uid = (auth.currentUser && auth.currentUser.uid) || "";
  const currentUserDbRef = db.ref(`users/${uid}`);
  const [currentUser, loadingUser] = useObjectVal(currentUserDbRef);
  const logout = () => auth.signOut();

  if (loadingUser) return <Loading />;
  return (
    <Container>
      <Content>
        <List>
          {currentUser && currentUser.email ? (
            <View>
              <Content padder>
                <Header
                  title={`Hi ${currentUser.firstName},`}
                  content={`You are currently logged in as ${currentUser.email}`}
                />
              </Content>

              <ListItem onPress={Actions.updateProfile} icon>
                <Left>
                  <Icon name="person-add" />
                </Left>
                <Body>
                  <Text>Update My Profile</Text>
                </Body>
              </ListItem>
              <ListItem onPress={logout} icon>
                <Left>
                  <Icon name="power" />
                </Left>
                <Body>
                  <Text>Logout</Text>
                </Body>
              </ListItem>
            </View>
          ) : (
            <View>
              <Content padder>
                <Header
                  title="Register"
                  content="Registered users can back-up their history across devices, share achievements and much more."
                />
              </Content>

              <ListItem onPress={Actions.logIn} icon>
                <Left>
                  <Icon name="power" />
                </Left>
                <Body>
                  <Text>Login</Text>
                </Body>
              </ListItem>
              <ListItem onPress={Actions.signUp} icon>
                <Left>
                  <Icon name="add-circle" />
                </Left>
                <Body>
                  <Text>Sign Up</Text>
                </Body>
              </ListItem>
              <ListItem onPress={Actions.forgotPassword} icon>
                <Left>
                  <Icon name="help-buoy" />
                </Left>
                <Body>
                  <Text>Forgot Password</Text>
                </Body>
              </ListItem>
            </View>
          )}
        </List>
      </Content>
    </Container>
  );
};

export default ProfileScreen;
