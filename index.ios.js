/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import * as firebase from 'firebase';
import React, {Component} from 'react';
import {
  AppRegistry,
  Button,
  Picker,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

// Enable StackNavigator
import { StackNavigator } from 'react-navigation';

// Home screen
class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    Firebase.initialise();
  }
  static navigationOptions = {
    title: 'Welcome to 30Palos',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Button
          onPress={() => navigate('Login')}
          title="Login"
        />
        <Button
          onPress={() => navigate('NewUser')}
          title="New User"
        />
        <Button
          onPress={() => navigate('RegularUser')}
          title="Regular User"
        />
        <Button
          onPress={() => navigate('ManagerUser')}
          title="Manager User"
        />
        <Button
          onPress={() => navigate('AdminUser')}
          title="Admin User"
        />
        <Button
          onPress={() => navigate('MyActivity')}
          title="My Activity"
        />
      </View>
    ) 
  }
}

// Login screen
class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
                  userEmail: 'None',
                  myPassword: 'None',
                  response: 'Not logged in',
                };
  }
  static navigationOptions = {
    title: 'Log into your account',
  };
  async login() {

      try {
          await firebase.auth().signInWithEmailAndPassword(this.state.userEmail, this.state.myPassword);

          this.setState({
              response: "Logged In!"
          });
            const { navigate } = this.props.navigation;
            navigate('RegularUser');
      } catch (error) {
          this.setState({
              response: error.toString()
          })
      }

  }
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{padding: 10}}>
        <TextInput
          style={{height: 40}}
          placeholder="Enter your email"
          onChangeText={(userEmail) => this.setState({userEmail})}
        />
        <TextInput secureTextEntry={true}
          style={{height: 40}}
          placeholder="Enter your password"
          onChangeText={(myPassword) => this.setState({myPassword})}
        />
        <Button
          title="Submit"
          onPress={() => this.login()}
        />
        <Text>{this.state.response}</Text>  
      </View>
    );
  }
}

// New user screen
class NewUserScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
                  userID: 'None',
                  userEmail: 'None',
                  myPassword: 'None',
                  userName: 'John',
                  userLastName: 'Doe',
                  userManager: 'None',
                  userRole: 'Regular User',
                  response: 'Hola',
                };
  }
  static navigationOptions = {
    title: 'Create New User',
  };
  async signup() {

        try {
            await firebase.auth().createUserWithEmailAndPassword(this.state.userEmail, this.state.myPassword);

            this.setState({
                response: "account created"
            });
            // Add remaining user data to the database
            Database.setUserData(this.state.userID, this.state.userEmail, this.state.userName, this.state.userLastName, this.state.userManager, this.state.userRole);

        } catch (error) {
            this.setState({
                response: error.toString()
            })
        }

    }
  render() {
    return (
      <View style={{padding: 10}}>
        <TextInput
          style={{height: 40}}
          placeholder="Enter user ID"
          onChangeText={(userID) => this.setState({userID})}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Enter email"
          onChangeText={(userEmail) => this.setState({userEmail})}
        />
        <TextInput secureTextEntry={true}
          style={{height: 40}}
          placeholder="Enter your password"
          onChangeText={(myPassword) => this.setState({myPassword})}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Enter name"
          onChangeText={(userName) => this.setState({userName})}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Enter last name"
          onChangeText={(userLastName) => this.setState({userLastName})}
        />  
        <TextInput
          style={{height: 40}}
          placeholder="Manager (optional)"
          onChangeText={(userManager) => this.setState({userManager})}
        />  
        <Picker
          selectedValue={this.state.userRole}
          onValueChange={(itemValue, itemIndex) => this.setState({userRole: itemValue})}>
          <Picker.Item label="Regular User" value="Regular" />
          <Picker.Item label="Manager" value="Manager" />
          <Picker.Item label="Admin" value="Admin" />
        </Picker>
        <Button
          title="Create"
          onPress={() => this.signup()}
        />  
        <Text>{this.state.response}</Text>                    
      </View>
    );
  }
}

// Regular user screen
class RegularUserScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome, User',
  };
  render() {
    return (
      <View>
        <Button
          onPress={() => navigate('NewActivity')}
          title="Add new activity"
        />
        <Button
          onPress={() => navigate('MyActivity')}
          title="My Activity"
        />
      </View>
    );
  }
}

// Manager user screen
class ManagerUserScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome, Manager',
  };
  render() {
    return (
      <View>
        <Text>Placeholder</Text>
      </View>
    )
  }
}

// Admin user screen
class AdminUserScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome, Admin',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Button
          onPress={() => navigate('NewUser')}
          title="Add new user"
        />
        <Button
          onPress={() => navigate('EditUser')}
          title="Edit user"
        />
        <Button
          onPress={() => navigate('DeleteUser')}
          title="Delete user"
        />
      </View>
    )
  }
}

// My activity screen
class MyActivityScreen extends React.Component {
  static navigationOptions = {
    title: 'Welcome to my activity',
  };
  render() {
    return (
      <View>
        <Text>Placeholder</Text>
      </View>
    )
  }
}

// Initialize Firebase
// Code from: https://github.com/JamesMarino/Firebase-ReactNative/blob/master/includes/firebase/firebase.js
class Firebase {

  /**
   * Initialises Firebase
   */
  static initialise() {
      firebase.initializeApp({
        apiKey: "AIzaSyAFFb0sQCmtga-78QrG5QUuFKBOk-YCYmo",
        authDomain: "palos-5bd92.firebaseapp.com",
        databaseURL: "https://palos-5bd92.firebaseio.com",
        projectId: "palos-5bd92",
        storageBucket: "palos-5bd92.appspot.com",
        messagingSenderId: "204756878847"
      });
  }
}

// Database operations
class Database {
  static setUserData(userID, userEmail, userName, userLastName, userManager, userRole) {
    let userPath = "/user/" + userID + "/details";
    return firebase.database().ref(userPath).set({
            userEmail: userEmail,
            userName: userName,
            userLastName: userLastName,
            userManager: userManager,
            userRole: userRole,
        })
  }
}

const project30Palos = StackNavigator({
  Home: { screen: HomeScreen },
  Login: { screen: LoginScreen },
  NewUser: { screen : NewUserScreen },
  RegularUser : { screen : RegularUserScreen },
  ManagerUser : { screen : ManagerUserScreen },
  AdminUser : { screen : AdminUserScreen },
  MyActivity : { screen : MyActivityScreen },
});

AppRegistry.registerComponent('project30Palos', () => project30Palos);
