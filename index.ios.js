/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
'use strict';
var RandManager = require('./RandManager.js');
var Swiper = require('react-native-swiper');
var NetworkImage = require('react-native-image-progress');
var Progress = require('react-native-progress');
var React = require('react');
var ReactNative = require('react-native');
var Utils = require('./Utils');
var ProgressHUD = require('./ProgressHUD');
var ShakeEvent = require('react-native-shake-event-ios');

console.log(Progress);

// import React, { Component } from 'react';
var Component = React.Component;
var Dimensions = ReactNative.Dimensions;
var PanResponder = ReactNative.PanResponder;
var CameraRoll = ReactNative.CameraRoll;
var AlertIOS = ReactNative.AlertIOS;

// import {
//   React,
//   Component,
//   Dimensions
// } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS
} from 'react-native';

const NUM_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300;
const DOUBLE_TAP_RADIUS = 20;
var {width, height} = Dimensions.get('window');

class SplashWalls extends Component {
  constructor(props){
    super(props);

    this.state = {
    wallsJSON: [],
    isLoading: true,
    isHudVisible: false
    };

    this.imagePanResponder = {};

    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimeStamp: 0
    }

    this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);

    this.currentWallIndex = 0;
  }

  fetchWallsJSON(){
    var url = 'http://unsplash.it/list';
    fetch(url)
      .then( response => response.json())
      .then( jsonData => {
        var randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
        var walls = [];
        randomIds.forEach(randomId => {
          walls.push(jsonData[randomId]);
        });
        this.setState({
          isLoading: false,
          wallsJSON: [].concat(walls)
        });
      })
    .catch( error => console.log('Fetch error ' + error));
  }

  componentDidMount(){
    this.fetchWallsJSON();
  }

  componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    });

    ShakeEvent.addEventListener('shake', () => {
      this.initialize();
      this.fetchWallsJSON();
    });
  }

  renderLoadingMessage(){
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicatorIOS
            animating={true}
            color={'#fff'}
            size={'small'}
            style={{margin: 15}} />
            <Text style={{color: '#fff'}}>Contacting Unsplash</Text>
      </View>
    );
  }

  renderResults() {
    var {wallsJSON, isLoading, isHudVisible} = this.state;
    if (!isLoading) {
      return (
        <View>
          <Swiper
            dot={<View style={{backgroundColor: 'rgba(255,255,255,.4)', width: 8, height: 8, borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}}/>}
            activeDot={<View style={{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}}/>}
            loop={false}
            onMomentumScrollEnd={this.onMomentumScrollEnd}
            index={this.currentWallIndex}
            >
            {wallsJSON.map((wallpaper, index) => {
              return (
                <View key={index}>
                  <NetworkImage
                    source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                    indicator={Progress.Circle}
                    style={styles.wallpaperImage}
                    indicatorProps={{
                      color: 'rgba(255,255,255)',
                      size: 60,
                      thickness: 7
                    }}
                    {...this.imagePanResponder.panHandlers}>
                    <Text style={styles.label}>Photo by</Text>
                    <Text style={styles.label_authorName}>{wallpaper.author}</Text>
                  </NetworkImage>
                </View>
              );
            })}
          </Swiper>
          <ProgressHUD width={width} height={height} isVisible={isHudVisible}/>
        </View>
      );
    }
  }

  render() {
    var {isLoading} = this.state;
    if (isLoading)
      return this.renderLoadingMessage();
    else
      return this.renderResults();
  }

  handleStartShouldSetPanResponder(e, gestureState) {
    return true;
  }

  handlePanResponderGrant(e, gestureState){
    var currentTouchTimeStamp = Date.now();

    if (this.isDoubleTap(currentTouchTimeStamp, gestureState))
      this.saveCurrentWallpaperToCameraRoll();

    this.prevTouchInfo = {
      prevTouchX: gestureState.x0,
      prevTouchY: gestureState.y0,
      prevTouchTimeStamp: currentTouchTimeStamp
    }
    // console.log('Finger touched the image');
  }

  handlePanResponderEnd(e, gestureState){
    // console.log('Finger pulled up from the image');
  }

  isDoubleTap(currentTouchTimeStamp, {x0, y0}){
    var {prevTouchX, prevTouchY, prevTouchTimeStamp} = this.prevTouchInfo;
    var dt = currentTouchTimeStamp - prevTouchTimeStamp;

    return (dt < DOUBLE_TAP_DELAY && Utils.distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
  }

  onMomentumScrollEnd(e, state, context){
    this.currentWallIndex = state.index;
  }

  saveCurrentWallpaperToCameraRoll() {
    this.setState({isHudVisible: true});

    var {wallsJSON} = this.state;
    var currentWall = wallsJSON[this.currentWallIndex];
    var currentWallURL = `http://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;

    CameraRoll.saveImageWithTag(currentWallURL, (data) => {
      this.setState({isHudVisible: false});

      AlertIOS.alert(
        'Saved',
        'Wallpaper successfully saved to Camera Roll',
        [
          {text: 'Okay', onPress: () => console.log('OK Pressed!')}
        ]
      );
    }, (err) => {
      console.log('Error saving to Camera Roll', err);
    });
  }

  initialize() {
    this.setState({
      wallsJSON: [],
      isLoading: true,
      isHudVisible: false
    });

    this.currentWallIndex = 0;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  wallpaperImage: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#000'
  },
  label:{
    position: 'absolute',
    color: '#fff',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 20,
    left: 20,
    width: width/2
  },
  label_authorName: {
    position: 'absolute',
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 41,
    left: 20,
    fontWeight: 'bold',
    width: width/2
  }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
