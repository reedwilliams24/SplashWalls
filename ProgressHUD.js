'use strict';

var React = require('react');
var Component = React.Component;

import {
  View,
  Text,
  ActivityIndicatorIOS
} from 'react-native';


// var View = React.View;
// var Text = React.Text;
// var Component = React.Component;
// var ActivityIndicatorIOS = React.ActivityIndicatorIOS;

class ProgressHUD extends Component {
  constructor(props){
    super(props);
  }

  render(){
    var {width, height, isVisible} = this.props;
    if (isVisible){
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: width,
            height: height,
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
            <ActivityIndicatorIOS
              animating={true}
              color={'#fff'}
              size={'large'}
              style={{margin: 15}}/>
              <Text style={{color: '#fff'}}>Please wait...</Text>
          </View>
      )
    } else {
      return (
        <View></View>
      )
    }
  }
};

module.exports = ProgressHUD;
