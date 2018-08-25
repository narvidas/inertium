import React from 'react';
import { Container, Content, Text, H1, H2, H3, Button } from 'native-base';
import Spacer from './Spacer';
import { AreaChart, ProgressCircle } from 'react-native-svg-charts'
import { Circle } from 'react-native-svg'
import { Header, Title, Icon, Right, Body, Left, Picker, Form } from "native-base";
import PropTypes from 'prop-types';
import platform from '../../../native-base-theme/variables/commonColor';
import { View } from 'react-native';

class Analytics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      habitSelected: this.props.habits[0].key,
      habitData: this.props.habits[0]
    };
  }
  onValueChange(value: string) {
    this.setState({
      habitSelected: value,
      habitData: this.props.habits.find((h)=>h.key===value)
    });
  }

  render() {
    const {habits} = this.props;
    const fontSizeH1 = platform.fontSizeH1;
    const lineHeightH1 = platform.lineHeightH1;
    const fontFamilyH1 = platform.fontFamily;
    const textColor = platform.textColor;

    return (
      <Container>
        <Content padder>
          <Form>
            <Picker
              mode="dropdown"
              iosIcon={<Icon name="ios-arrow-down-outline" />}
              headerStyle={{backgroundColor: '#48914D'}}
              textStyle={{paddingLeft: 0, color: textColor, fontSize: fontSizeH1, lineHeight: lineHeightH1, fontFamily: fontFamilyH1}}
              selectedValue={this.state.habitSelected}
              onValueChange={this.onValueChange.bind(this)}
            >
              {habits.map((habit=>{
                return <Picker.Item label={habit.title} value={habit.key} key={habit.key}/>
              }
              ))}
            </Picker>
          </Form>
          <Spacer size={10} />
          <View style={{flex: 1, flexDirection: 'row', height: 50, justifyContent: 'space-between',}}>
            <View style={{flex: 1, flexDirection: 'column', height: 50, justifyContent: 'center',}}>
              <Text> Weekly target {this.state.habitData.goal} days a week </Text>
            </View>
            <ProgressCircle
                style={ { height: 50, width: 50} }
                progress={this.state.habitData.goal/7}
                progressColor={'rgb(134, 65, 244)'}
                strokeWidth={10}
            />
          </View>
          <Spacer size={30} />
          <View style={{flex: 1, flexDirection: 'row', height: 50, justifyContent: 'space-between',}}>
            <View style={{flex: 1, flexDirection: 'column', height: 50, justifyContent: 'center',}}>
              <Text> Actual average {(this.state.habitData.goal*0.5665).toFixed(2)} days a week </Text>
            </View>
            <ProgressCircle
                style={ { height: 50, width: 50} }
                progress={this.state.habitData.goal*0.5665/7}
                progressColor={'rgb(134, 65, 244)'}
                strokeWidth={10}
            />
          </View>

          <Spacer size={30} />
          <Text>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </Text>
          <Spacer size={30} />
          <AreaChart
              style={ { height: 200 } }
              data={ [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ] }
              svg={ { fill: 'rgba(134, 65, 244, 0.2)' } }
              contentInset={ { top: 20, bottom: 30 } }
              renderDecorator={ ({ x, y, index, value }) => (
                  <Circle
                      key={ index }
                      cx={ x(index) }
                      cy={ y(value) }
                      r={ 4 }
                      stroke={ 'rgb(134, 65, 244)' }
                      fill={ 'white' }
                  />
              ) }
          />

        </Content>
      </Container>
    );
  }
}

Analytics.propTypes = {
  error: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  habits: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};


Analytics.defaultProps = {
  error: null,
  reFetch: null,
};

export default Analytics;
