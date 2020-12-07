import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import React, { FC, useState } from "react";
import { Text, TouchableHighlight, View } from "react-native";
import { useDispatch } from "react-redux";
import { updateOrCreateItem } from "../../habits.slice";
import { Item, Status } from "../../types";
import { styles } from "./ItemComponent.styles";
import { ItemModal } from "./ItemModal";

const getStyle = (status: Status) => {
  if (status === "done") return styles.done;
  if (status === "fail") return styles.fail;
  return null;
};

interface OwnProps {
  habitId: string;
}

type Props = Item & OwnProps;

export const ItemComponent: FC<Props> = ({ habitId, ...item }) => {
  const dispatch = useDispatch();
  const [itemModalVisible, setItemModalVisible] = useState(false);

  const date = parseISO(item.date);
  const dayOfWeekWord = format(date, "EEE"); // E.g. 'SUN' for Sunday
  const dayOfMonthNumber = format(date, "d"); // E.g. '14' for 14th December
  const notesExist = item.notes && item.notes !== "";

  const updateStatus = () => {
    let newStatus: Status = "default";
    if (item.status === "default") newStatus = "done";
    if (item.status === "done") newStatus = "fail";
    if (item.status === "fail") newStatus = "default";

    const newItem = { ...item, status: newStatus };
    dispatch(updateOrCreateItem({ habitId, item: newItem }));
  };

  return (
    <>
      <ItemModal
        defaultValues={{ notes: item.notes }}
        visible={itemModalVisible}
        onSave={notes => dispatch(updateOrCreateItem({ habitId, item: { ...item, notes } }))}
        onClose={() => setItemModalVisible(false)}
      />
      <TouchableHighlight
        activeOpacity={1}
        underlayColor="rgba(0,0,0,0.25)"
        style={[styles.box, getStyle(item.status)]}
        onPress={updateStatus}
        onLongPress={() => setItemModalVisible(true)}
      >
        <View style={styles.dateContainer}>
          <Text style={[styles.dayOfWeekWord, getStyle(item.status)]}>{dayOfWeekWord}</Text>
          <Text style={[styles.dayOfMonthNumber, getStyle(item.status)]}>{dayOfMonthNumber}</Text>
          {notesExist ? <Text style={styles.notesDot}>{`.`}</Text> : null}
        </View>
      </TouchableHighlight>
    </>
  );
};
