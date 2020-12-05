import format from "date-fns/format";
import React, { FC, useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { Item, Status } from "../../types";
import { styles } from "./ItemComponent.styles";

const getStyle = (status: Status) => {
  if (status === "done") return styles.done;
  if (status === "fail") return styles.fail;
  return null;
};

interface OwnProps {
  defaultStatus: Status;
}

type Props = Item & OwnProps;

export const ItemComponent: FC<Props> = ({ defaultStatus, date }) => {
  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December
  const [status, setStatus] = useState(defaultStatus);
  return (
    <TouchableHighlight
      activeOpacity={1}
      underlayColor="rgba(0,0,0,0.25)"
      style={[styles.box, getStyle(status)]}
      onPress={() => {
        if (status === "default") setStatus("done");
        if (status === "done") setStatus("fail");
        if (status === "fail") setStatus("default");
      }}
      // onLongPress={() => openItemModal(item.key, habitKey, item.notes, startingDate, rowID)}
    >
      <View style={styles.dateContainer}>
        <Text style={[styles.dayOfWeekWord, getStyle(status)]}>{dayOfWeekWord}</Text>
        <Text style={[styles.dayOfMonthNumber, getStyle(status)]}>{dayOfMonthNumber}</Text>
      </View>
    </TouchableHighlight>
  );
};
