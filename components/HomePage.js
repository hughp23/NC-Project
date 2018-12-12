import { Button } from 'react-native';
import React, { Component } from 'react';
import * as firebase from 'firebase';

const { firestore } = require('../config');

const {
  getUserLocation,
  filterUsersByDistance,
  logOut,
} = require('../Functionality/utilityFunctions');

class HomePage extends Component {
  state = {
    currentUser: null,
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        getUserLocation(currentUser, (err, locationAndError) => {
          this.setState(
            {
              currentUser,
              ...locationAndError,
            },
            () => {
              filterUsersByDistance(this.state.currentUser, (err, nearbyUsers) => {
                console.log(nearbyUsers, 'nearbyUsers');
              });
            },
          );
        });
      }
    });
  }

  handleLogout = () => {
    logOut();
    this.setState({
      currentUser: null,
    });
    this.props.navigation.navigate('AuthLoading');
  };

  render() {
    return <Button title="Log out" onPress={this.handleLogout} />;
  }
}

export default HomePage;
