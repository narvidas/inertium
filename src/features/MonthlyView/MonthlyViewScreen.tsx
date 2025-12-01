import { RouteProp, useRoute } from "@react-navigation/native";
import subMonths from "date-fns/subMonths";
import React, { FC, useCallback, useContext, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Container, Root } from "../../ui";
import SyncContext from "../../config/remote/syncContext";
import { successToast } from "../../utils/toast";
import { habitSelector } from "../Habits/habits.slice";
import { MonthCalendarGrid } from "./components/MonthCalendarGrid";
import { styles } from "./MonthlyViewScreen.styles";
import { MonthlyViewRouteParams } from "./types";

type MonthlyViewRouteProp = RouteProp<MonthlyViewRouteParams, "MonthlyView">;

interface MonthItem {
  id: string;
  year: number;
  month: number;
}

// Number of months to show initially and load more
const INITIAL_MONTHS = 6;
const LOAD_MORE_MONTHS = 3;

export const MonthlyViewScreen: FC = () => {
  const route = useRoute<MonthlyViewRouteProp>();
  const { habitId } = route.params;
  const dispatch = useDispatch();
  const habit = useSelector(habitSelector(habitId));
  const { syncHabit } = useContext(SyncContext);
  const [syncing, setSyncing] = useState(false);
  const [monthsToShow, setMonthsToShow] = useState(INITIAL_MONTHS);

  // Generate months data (current month and previous months)
  const months = useMemo((): MonthItem[] => {
    const result: MonthItem[] = [];
    const today = new Date();

    for (let i = 0; i < monthsToShow; i++) {
      const monthDate = subMonths(today, i);
      result.push({
        id: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
      });
    }

    return result;
  }, [monthsToShow]);

  const onRefresh = useCallback(async () => {
    setSyncing(true);
    await syncHabit(habitId);
    setSyncing(false);
    successToast("Sync complete.");
  }, [syncHabit, habitId]);

  const loadMoreMonths = useCallback(() => {
    setMonthsToShow((prev) => prev + LOAD_MORE_MONTHS);
  }, []);

  const renderMonth = useCallback(
    ({ item }: { item: MonthItem }) => {
      if (!habit) return null;
      return (
        <MonthCalendarGrid
          habit={habit}
          year={item.year}
          month={item.month}
        />
      );
    },
    [habit]
  );

  const keyExtractor = useCallback((item: MonthItem) => item.id, []);

  if (!habit) {
    return null;
  }

  return (
    <Root testID="monthly-view-root">
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Container>
          <View style={styles.monthsList} testID="monthly-view-list">
            <FlatList
              data={months}
              renderItem={renderMonth}
              keyExtractor={keyExtractor}
              refreshControl={
                <RefreshControl refreshing={syncing} onRefresh={onRefresh} />
              }
              onEndReached={loadMoreMonths}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </Container>
      </SafeAreaView>
    </Root>
  );
};

export default MonthlyViewScreen;

