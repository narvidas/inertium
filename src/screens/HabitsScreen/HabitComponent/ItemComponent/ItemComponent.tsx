import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import React, { FC, useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateItemStatus } from "../../habits.slice";
import { Item, Status } from "../../types";
import { styles } from "./ItemComponent.styles";

const getStyle = (status: Status) => {
  if (status === "done") return styles.done;
  if (status === "fail") return styles.fail;
  return null;
};

interface OwnProps {
  habitId: string;
  defaultStatus: Status;
}

type Props = Item & OwnProps;

export const ItemComponent: FC<Props> = ({ habitId, defaultStatus, ...item }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(defaultStatus);

  const date = parseISO(item.date);
  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December

  const updateStatus = () => {
    let newStatus = defaultStatus;
    if (status === "default") newStatus = "done";
    if (status === "done") newStatus = "fail";
    if (status === "fail") newStatus = "default";

    const newItem = { ...item, status: newStatus };
    setStatus(newStatus);
    dispatch(updateItemStatus({ habitId, item: newItem }));
  };

  return (
    <TouchableHighlight
      activeOpacity={1}
      underlayColor="rgba(0,0,0,0.25)"
      style={[styles.box, getStyle(status)]}
      onPress={updateStatus}
      onLongPress={() => {
        /*open item modal*/
      }}
    >
      <View style={styles.dateContainer}>
        <Text style={[styles.dayOfWeekWord, getStyle(status)]}>{dayOfWeekWord}</Text>
        <Text style={[styles.dayOfMonthNumber, getStyle(status)]}>{dayOfMonthNumber}</Text>
      </View>
    </TouchableHighlight>
  );
};
