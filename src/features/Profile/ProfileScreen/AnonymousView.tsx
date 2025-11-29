import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { Body, Left, List, ListItem, Text, View } from "../../../ui";
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
            <Ionicons name="log-in-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>Login</Text>
          </Body>
        </ListItem>
        <ListItem onPress={() => navigation.navigate("Register")} icon>
          <Left>
            <Ionicons name="add-circle-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>Register</Text>
          </Body>
        </ListItem>
        <ListItem onPress={() => navigation.navigate("Forgot Password")} icon>
          <Left>
            <Ionicons name="help-circle-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>Forgot Password</Text>
          </Body>
        </ListItem>
      </List>
    </View>
  </View>
);
