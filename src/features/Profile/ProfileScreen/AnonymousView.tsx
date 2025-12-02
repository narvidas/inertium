import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Body, Left, List, ListItem, Text, View } from "../../../ui";
import React, { FC, useCallback, useState } from "react";
import { Alert } from "react-native";
import { useSelector } from "react-redux";
import { Header } from "../../../components/Header";
import { RootState } from "../../../config/rtk/rootReducer";
import { generateHabitsCSV, generateExportFilename } from "../utils";

interface Props {
  navigation: NavigationProp<any>;
}

export const AnonymousView: FC<Props> = ({ navigation }) => {
  const [exporting, setExporting] = useState(false);

  // Get habits data from Redux
  const habits = useSelector((state: RootState) => state.habitsState.habits);
  const order = useSelector((state: RootState) => state.habitsState.order.order);

  const exportData = useCallback(async () => {
    try {
      setExporting(true);

      // Generate CSV content
      const csvContent = generateHabitsCSV(habits, order);
      const filename = generateExportFilename();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }

      // Write to temporary file
      const file = new File(Paths.cache, filename);
      await file.write(csvContent);

      // Share the file
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Export Habits Data",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Unable to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [habits, order]);

  return (
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
          <ListItem onPress={exportData} icon disabled={exporting}>
            <Left>
              <Ionicons name="download-outline" size={24} color="#555" />
            </Left>
            <Body>
              <Text>{exporting ? "Exporting..." : "Export Data (CSV)"}</Text>
            </Body>
          </ListItem>
        </List>
      </View>
    </View>
  );
};
