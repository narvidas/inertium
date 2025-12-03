import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Body, Left, List, ListItem, Text, View } from "../../../ui";
import React, { FC, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../../../components/Header";
import { Loading } from "../../../components/Loading";
import FirebaseContext from "../../../config/remote/firebaseContext";
import { RootState } from "../../../config/rtk/rootReducer";
import { clearHabitsState } from "../../ScrollableHabits/habits.slice";
import { generateHabitsCSV, generateExportFilename } from "../utils";

interface Props {
  navigation: NavigationProp<any>;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const AuthenticatedView: FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { db, auth } = useContext(FirebaseContext);
  const uid = auth.currentUser?.uid;
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Get habits data from Redux
  const habits = useSelector((state: RootState) => state.habitsState.habits);
  const order = useSelector((state: RootState) => state.habitsState.order.order);

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

  const logout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Logging out will clear all local habit data from this device. Your data is will be restored if you log back in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // Clear local state to prevent data leakage to other accounts
            dispatch(clearHabitsState());
            auth.signOut();
            navigation.navigate("Profile");
          },
        },
      ],
    );
  }, [auth, dispatch, navigation]);

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
        <ListItem onPress={exportData} icon disabled={exporting}>
          <Left>
            <Ionicons name="download-outline" size={24} color="#555" />
          </Left>
          <Body>
            <Text>{exporting ? "Exporting..." : "Export Data (CSV)"}</Text>
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
