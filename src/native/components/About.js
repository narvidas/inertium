import React from 'react';
import { Container, Content, Text, H1, H2, H3, Button } from 'native-base';
import Spacer from './Spacer';
import { AreaChart } from 'react-native-svg-charts'
import { Circle } from 'react-native-svg'

const About = () => (

  <Container>
    <Content padder>
      <Spacer size={30} />
      <H1>Heading 1</H1>
      <Spacer size={10} />
      <Text>Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </Text>

      <Spacer size={30} />
      <H2>Heading 2</H2>
      <Spacer size={10} />
      <Text>Elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </Text>

      <Spacer size={30} />
      <H3>Heading 3</H3>
      <Spacer size={10} />
      <Text>Elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui. </Text>

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

export default About;
