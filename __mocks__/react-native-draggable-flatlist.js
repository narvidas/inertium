import React from "react";
import { View, FlatList } from "react-native";

const DraggableFlatList = ({
  data,
  renderItem,
  keyExtractor,
  refreshControl,
  ListHeaderComponent,
  ListFooterComponent,
  onDragEnd,
}) => {
  return (
    <View testID="draggable-list" onDragEnd={onDragEnd}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => renderItem({ item, drag: () => {}, isActive: false, getIndex: () => index })}
        keyExtractor={keyExtractor}
        refreshControl={refreshControl}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
      />
    </View>
  );
};

export default DraggableFlatList;
