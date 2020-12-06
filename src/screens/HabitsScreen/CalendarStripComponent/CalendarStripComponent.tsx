import React, { FC, useRef } from "react";
import CalendarStrip from "react-native-calendar-strip";
import GestureRecognizer from "react-native-swipe-gestures";

interface Props {
  onWeekChanged: (startOfNewWeek: Date) => void;
  onToday?: () => void;
}

export const CalendarStripComponent: FC<Props> = ({ onWeekChanged, onToday }) => {
  const ref = useRef(null);
  return (
    <>
      <GestureRecognizer
        onSwipeLeft={() => ref.current?.getNextWeek()}
        onSwipeRight={() => ref.current?.getPreviousWeek()}
      >
        <CalendarStrip
          ref={ref}
          updateWeek={false}
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
          styleWeekend={false}
          onWeekChanged={onWeekChanged}
          onToday={() => onToday?.()}
        />
      </GestureRecognizer>
    </>
  );
};
