import { View } from "../../../ui";
import React, { FC, useRef } from "react";
import GestureRecognizer from "react-native-swipe-gestures";
import { CalendarStrip, CalendarStripRef } from "../../../components/CalendarStrip";

interface Props {
  onWeekChanged: (startOfNewWeek: Date) => void;
  onToday?: () => void;
}

export const CalendarStripComponent: FC<Props> = ({ onWeekChanged, onToday }) => {
  const ref = useRef<CalendarStripRef>(null);
  return (
    <View style={{ paddingTop: 10, paddingBottom: 20 }}>
      <GestureRecognizer
        onSwipeLeft={() => ref.current?.getNextWeek()}
        onSwipeRight={() => ref.current?.getPreviousWeek()}
      >
        <CalendarStrip
          ref={ref}
          daySelectionAnimation={{
            type: "border",
            duration: 100,
            borderWidth: 1,
            borderHighlightColor: "rgba(0,0,0,0.8)",
          }}
          style={{ height: 100, paddingTop: 20, paddingBottom: 15 }}
          calendarHeaderStyle={{ paddingBottom: 15 }}
          highlightDateNumberStyle={{ textDecorationLine: "underline" }}
          iconContainer={{ width: 40 }}
          onWeekChanged={onWeekChanged}
          onToday={onToday}
        />
      </GestureRecognizer>
    </View>
  );
};
