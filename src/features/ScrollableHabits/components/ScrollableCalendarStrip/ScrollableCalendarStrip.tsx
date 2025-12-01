import { Ionicons } from "@expo/vector-icons";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import formatISO from "date-fns/formatISO";
import getDate from "date-fns/getDate";
import isMonday from "date-fns/isMonday";
import isToday from "date-fns/isToday";
import React, { FC, useCallback, useMemo, useRef } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useScrollViewSync } from "../../context";
import { DayItemData } from "../../types";
import { styles } from "./ScrollableCalendarStrip.styles";

const SCROLL_VIEW_ID = "calendar-strip";

interface DayItemProps {
  item: DayItemData;
  dayWidth: number;
  onMondayPress?: (date: Date) => void;
}

const DayItem: FC<DayItemProps> = React.memo(({ item, dayWidth, onMondayPress }) => {
  const { date, isToday: isTodayDate } = item;
  const isMondayDate = isMonday(date);

  const handlePress = useCallback(() => {
    if (isMondayDate && onMondayPress) {
      onMondayPress(date);
    }
  }, [isMondayDate, onMondayPress, date]);

  const content = (
    <View style={[
      styles.dayContainer, 
      { width: dayWidth, height: dayWidth }, 
      isTodayDate && styles.dayContainerToday,
      !isMondayDate && styles.dayContainerFaded,
    ]}>
      <Text style={[
        styles.dateName, 
        !isMondayDate && styles.textFaded,
        isMondayDate && styles.textMonday,
      ]}>
        {format(date, "EEE").toUpperCase()}
      </Text>
      <Text style={[
        styles.dateNumber, 
        isTodayDate && styles.dateNumberToday,
        !isMondayDate && styles.textFaded,
        isMondayDate && styles.textMonday,
      ]}>
        {getDate(date)}
      </Text>
    </View>
  );

  // Only Mondays are clickable
  if (isMondayDate) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

DayItem.displayName = "DayItem";

interface Props {
  onScrollToThisWeek?: () => void;
}

export const ScrollableCalendarStrip: FC<Props> = ({ onScrollToThisWeek }) => {
  const flatListRef = useRef<FlatList<DayItemData>>(null);
  const {
    dayWidth,
    bufferDays,
    centerDate,
    visibleMonth,
    scrollToDate,
    scrollToThisWeek,
    handleScroll,
    handleScrollBegin,
    handleScrollEnd,
  } = useScrollViewSync(SCROLL_VIEW_ID, flatListRef);

  // Generate dates for the virtualized list
  const dates = useMemo((): DayItemData[] => {
    const result: DayItemData[] = [];
    for (let i = -bufferDays; i <= bufferDays; i++) {
      const date = addDays(centerDate, i);
      result.push({
        date,
        isToday: isToday(date),
        dateKey: formatISO(date, { representation: "date" }),
      });
    }
    return result;
  }, [centerDate, bufferDays]);

  // Handle click on a Monday - scroll all views to that week
  const handleMondayPress = useCallback((mondayDate: Date) => {
    scrollToDate(mondayDate);
  }, [scrollToDate]);

  // Handle "This week" button press
  const handleScrollToThisWeek = useCallback(() => {
    scrollToThisWeek();
    onScrollToThisWeek?.();
  }, [scrollToThisWeek, onScrollToThisWeek]);

  const renderItem = useCallback(({ item }: { item: DayItemData }) => (
    <DayItem item={item} dayWidth={dayWidth} onMondayPress={handleMondayPress} />
  ), [dayWidth, handleMondayPress]);

  const keyExtractor = useCallback((item: DayItemData) => item.dateKey, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  }), [dayWidth]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{visibleMonth}</Text>
        <TouchableOpacity style={styles.thisWeekButton} onPress={handleScrollToThisWeek}>
          <Ionicons name="refresh" size={14} color="#fff" />
          <Text style={styles.thisWeekButtonText}>This week</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.daysContainer}>
        <FlatList
          ref={flatListRef}
          data={dates}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          initialScrollIndex={bufferDays}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={14}
          windowSize={5}
          initialNumToRender={14}
        />
      </View>
    </View>
  );
};

ScrollableCalendarStrip.displayName = "ScrollableCalendarStrip";
