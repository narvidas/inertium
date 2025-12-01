import addDays from "date-fns/addDays";
import format from "date-fns/format";
import formatISO from "date-fns/formatISO";
import getDate from "date-fns/getDate";
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
}

const DayItem: FC<DayItemProps> = React.memo(({ item, dayWidth }) => {
  const { date, isToday: isTodayDate } = item;

  return (
    <View style={[styles.dayContainer, { width: dayWidth, height: dayWidth }, isTodayDate && styles.dayContainerToday]}>
      <Text style={styles.dateName}>
        {format(date, "EEE").toUpperCase()}
      </Text>
      <Text style={[styles.dateNumber, isTodayDate && styles.dateNumberToday]}>
        {getDate(date)}
      </Text>
    </View>
  );
});

DayItem.displayName = "DayItem";

interface Props {
  onScrollToToday?: () => void;
}

export const ScrollableCalendarStrip: FC<Props> = ({ onScrollToToday }) => {
  const flatListRef = useRef<FlatList<DayItemData>>(null);
  const {
    initialOffset,
    dayWidth,
    bufferDays,
    centerDate,
    visibleMonth,
    scrollToToday,
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

  const renderItem = useCallback(({ item }: { item: DayItemData }) => (
    <DayItem item={item} dayWidth={dayWidth} />
  ), [dayWidth]);

  const keyExtractor = useCallback((item: DayItemData) => item.dateKey, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  }), [dayWidth]);

  const handleScrollToToday = useCallback(() => {
    scrollToToday();
    onScrollToToday?.();
  }, [scrollToToday, onScrollToToday]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{visibleMonth}</Text>
        <TouchableOpacity style={styles.todayButton} onPress={handleScrollToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
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
