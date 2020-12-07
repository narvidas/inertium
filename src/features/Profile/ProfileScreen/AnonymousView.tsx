import { NavigationProp } from "@react-navigation/native";
import { Body, Icon, Left, List, ListItem, Text, View } from "native-base";
import React, { FC } from "react";
import { Header } from "../../../components/Header";

interface Props {
  navigation: NavigationProp<any>;
}

export const AnonymousView: FC<Props> = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <Header
      title="Register"
      content="Register a free account and have your achievements automatically backed-up across devices."
    />
    <View>
      <List>
        <ListItem onPress={() => navigation.navigate("Login")} icon>
          <Left>
            <Icon name="power" />
          </Left>
          <Body>
            <Text>Login</Text>
          </Body>
        </ListItem>
        <ListItem onPress={() => navigation.navigate("Register")} icon>
          <Left>
            <Icon name="add-circle" />
          </Left>
          <Body>
            <Text>Register</Text>
          </Body>
        </ListItem>
        <ListItem onPress={() => navigation.navigate("Forgot Password")} icon>
          <Left>
            <Icon name="help-buoy" />
          </Left>
          <Body>
            <Text>Forgot Password</Text>
          </Body>
        </ListItem>
      </List>
    </View>
  </View>
);
