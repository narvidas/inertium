import React, { FC, useRef } from "react";
import CalendarStrip from "react-native-calendar-strip";
import GestureRecognizer from "react-native-swipe-gestures";

interface Props {}

export const CalendarStripComponent: FC<Props> = () => {
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
          // onWeekChanged={this.handleNewWeekSelection}
          // onToday={() => this.props.formatWeek(moment())}
        />
      </GestureRecognizer>
    </>
  );
};
