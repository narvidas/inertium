import React from 'react';
import PropTypes from 'prop-types';
import { H3, Text, List,  ListItem, Header, Icon } from 'native-base';
import Spacer from './Spacer';
import { View, StyleSheet, SectionList, TouchableHighlight, Button } from 'react-native';

class ItemView extends React.Component {
  setNativeProps = (nativeProps) => {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    const {id, startingDate, status} = this.props;
    const date = startingDate.clone().add(id, "days");
    return (
      <View ref={component => this._root = component} {...this.props}>
        <View style={styles.dateContainer}>
          <Text style={status==='done' ? styles.dateNameDone : styles.dateNameUndone}>
              {date.format("ddd").toUpperCase()}
          </Text>
          <Text style={status==='done' ? styles.dateNumberDone : styles.dateNumberUndone}>
              {date.date()}
          </Text>
        </View>
      </View>
    )
  }
}

class Habit extends React.Component {

  constructor(props) {
    super(props);
  }


  getBoxStyle(status){
    if(status==="done"){
      return styles.boxDone;
    } else if (status==="undone"){
      return styles.boxUndone;
    } else {
      return styles.boxGrey;
    }
  }

  renderRow = (item, sectionID, rowID) => {
      const {toggleItemStatus, openItemModal, startingDate, habitKey} = this.props;
      return (
        <ListItem style={styles.list}>
          <View>
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={"rgba(0,0,0,0.25)"}
              style={this.getBoxStyle(item.status)}
              onPress={()=> toggleItemStatus(item.key, habitKey, item.status, startingDate, rowID) }
              onLongPress={() => openItemModal(item.key, habitKey, item.notes, startingDate, rowID)}
              >
              <ItemView id={rowID} startingDate={startingDate} status={item.status}/>
            </TouchableHighlight>
          </View>
        </ListItem>
      );
    }

  render(){
    const {title, items, openHabitModal, habitKey, goal, startingDate, updateTest} = this.props;
    const completedGoalCount = String(items.filter(item=>item.status==='done').length);
    return(
      <View>
        <View style={{paddingLeft: 25, paddingRight: 25, paddingTop: 10}}>
          <View style={{flexDirection: 'row'}}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <H3>{title}{' ('}{completedGoalCount}{'/'}{String(goal || 0)}{')'}</H3>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }} >
              <TouchableHighlight
                activeOpacity={1}
                style={{borderRadius: 4}}
                underlayColor={"rgba(0,0,0,0.1)"}
                onPress={()=> openHabitModal(habitKey, title, goal)}
                >
                <Icon name="ios-settings" style={{fontSize:24, marginLeft:5, marginRight:5,color:'#555'}}/>
              </TouchableHighlight>
            </View>
          </View>
            <List
              dataArray={items}
              horizontal={true}
              removeClippedSubviews={false}
              style={styles.list}
              renderRow={this.renderRow}
             />
          </View>
        <Spacer size={15} />
      </View>
    );
  }
}

Habit.propTypes = {
  openItemModal: PropTypes.func.isRequired,
  toggleItemStatus: PropTypes.func.isRequired,
  openHabitModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  startingDate: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  boxUndone: {
    width: 42,
    height: 42,
    backgroundColor: '#e58570',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'white',
    margin: 0,
  },
  boxDone: {
    width: 42,
    height: 42,
    backgroundColor: '#5A9C5E',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'white',
    margin: 0,
  },
  boxGrey: {
    width: 42,
    height: 42,
    backgroundColor: '#ededed',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'white',
    margin: 0,
  },
  list: {
    padding: 0,
    borderBottomWidth: 0,
    marginLeft: 0, paddingLeft: 0, paddingRight: 0, marginRight: 0
  },
  //CALENDAR DAY
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 4
  },
  dateNameUndone: {
    textAlign: "center",
    color: "rgba(0,0,0,0.25)",
    fontSize: 10
  },
  dateNumberUndone: {
    fontWeight: "bold",
    color: "rgba(0,0,0,0.25)",
    textAlign: "center",
    fontSize: 14
  },
  dateNameDone: {
    textAlign: "center",
    color: "#fefefe",
    fontSize: 10
  },
  dateNumberDone: {
    fontWeight: "bold",
    color: "#fefefe",
    textAlign: "center",
    fontSize: 14
  },
});

export default Habit;
