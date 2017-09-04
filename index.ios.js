/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import * as firebase from 'firebase';
import React, {Component} from 'react';
import {
  Alert,
  AppRegistry,
  Button,
  FlatList,
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
              response: "Logged in!"
          });
          const { navigate } = this.props.navigation;
          
          // Get user id for the authenticated user
          let userID = firebase.auth().currentUser.uid;
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
          autoCapitalize = 'none'
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

            // Get user ID assigned by the database
            this.state.userID = firebase.auth().currentUser.uid;
            this.setState({
                response: this.state.userID
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
          keyboardType="email-address"
          autoCapitalize = 'none'
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
  constructor(props) {
    super(props);
    this.state = {
                  userID: 'None',
                  userName: 'None',
                };
    // Get userID
    this.state.userID = firebase.auth().currentUser.uid;

    // Get user name
    Database.listenUserName(this.state.userID, (userName) => {
        this.setState({
            userName: userName,
        });
    });
    
  }
  static navigationOptions = {
    title: 'Welcome, user'
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Button
          onPress={() => navigate('NewActivity')}
          title="Add New Activity"
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
  constructor(props) {
    super(props);
    this.state = {
                  userID: 'None',
                  userActivities: [],
                };
    // Get userID
    this.state.userID = firebase.auth().currentUser.uid;

    // Get user activities
    Database.getUserActivities(this.state.userID, (userActivities) => {
      this.state.userActivities = userActivities  
    });
    
  }
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <FlatList
          data={this.state.userActivities}
          renderItem={({item}) => 
            <Button
              onPress={() => navigate('IndividualActivity', {userID : this.state.userID, activityParams : item})}
              title={item.activityDate}
        /> }
        />
      </View>
    )
  }
}

// Individual activity screen
class IndividualActivityScreen extends React.Component {
  static navigationOptions = {
    title: 'Activity details',
  };
  constructor(props) {
    super(props);
    this.state = {
      userID: 'None',
      activityKey: 'None',
      activityDate: 'None',
      activityDistance : 'None',
      activityDuration : 'None',
    }
    // Get userID
    this.state.userID = this.props.navigation.state.params.userID;

    // Get activity parameters
    this.state.activityDate = this.props.navigation.state.params.activityParams.activityDate;
    this.state.activityDistance = this.props.navigation.state.params.activityParams.activityDistance;
    this.state.activityDuration = this.props.navigation.state.params.activityParams.activityDuration;

    // Get activityKey
    this.state.activityKey = this.props.navigation.state.params.activityParams.key;
  }
  // Handle deletion of activity
  async deleteActivity() {
    const { navigate } = this.props.navigation;
    Alert.alert(
      'Delete Activity',
      'This activiy will be deleted. Are you sure?',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Delete', onPress: () => {
                                          Database.deleteActivity(this.state.userID, this.state.activityKey);
                                          Alert.alert(
                                            '30Palos',
                                            'Activity Deleted',
                                            [
                                              {text: 'OK', onPress: () => navigate('MyActivity')},
                                            ]
                                          )
                                        }},
      ],
      { cancelable: false }
    )
  }
  render() {
    const { navigate } = this.props.navigation;
    return(
      <View  style={{padding: 10}}>
        <Text>Date: {this.state.activityDate}</Text>
        <Text>Distance: {this.state.activityDistance} miles</Text>
        <Text>Duration: {this.state.activityDuration} minutes</Text>
        <Button
          onPress={() => navigate('UpdateActivity', {userID : this.state.userID, activityParams : this.props.navigation.state.params.activityParams})}
          title="Edit activity"
        />
        <Button
          onPress={() => this.deleteActivity()}
          title="Delete activity"
        />
      </View>
    )
  }

}

// Add new activity screen
class AddNewActivityScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
                  userID : 'None',
                  activityDate: 'None',
                  activityDistance: 'None',
                  activityDuration: 'None',
                  //activitySpeed : 'None',
                  response: '',
                };
    // Get userID
    this.state.userID = firebase.auth().currentUser.uid;
  }  
  static navigationOptions = {
    title: 'Add new activity',
  };
  async saveActivity() {

    try {
        Database.saveUserActivity(this.state.userID, this.state.activityDate, this.state.activityDuration, this.state.activityDistance);
        this.setState({
            response: "Activity added"
        })
        const { navigate } = this.props.navigation;
        navigate('RegularUser');

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
          placeholder="Date (mm/dd/yy)"
          onChangeText={(activityDate) => this.setState({activityDate})}
        />
        <TextInput
          style={{height: 40}}
          keyboardType='numeric'
          placeholder="Distance (miles)"
          onChangeText={(activityDistance) => this.setState({activityDistance})}
        />
        <TextInput
          style={{height: 40}}
          keyboardType='numeric'
          placeholder="Duration (minutes)"
          onChangeText={(activityDuration) => this.setState({activityDuration})}
        />
        <Button
          title="Done"
          onPress={() => this.saveActivity()}
        />                   
        <Text>{this.state.response}</Text>
      </View>
    );
  }
}

class UpdateActivityScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
                  userID : 'None',
                  activityDate: 'None',
                  activityDistance: 'None',
                  activityDuration: 'None',
                  response: '',
                };
    // Get userID
    this.state.userID = firebase.auth().currentUser.uid;

    // Get activity parameters
    this.state.activityDate = this.props.navigation.state.params.activityParams.activityDate;
    this.state.activityDistance = this.props.navigation.state.params.activityParams.activityDistance;
    this.state.activityDuration = this.props.navigation.state.params.activityParams.activityDuration;

    // Get activityKey
    this.state.activityKey = this.props.navigation.state.params.activityParams.key;
  }
  static navigationOptions = {
    title: 'Update activity',
  }
  // Triggers update to the database
  async updateActivity() {
    try {
        Database.updateUserActivity(this.state.userID, this.state.activityKey, this.state.activityDate, this.state.activityDuration, this.state.activityDistance );
        this.setState({
            response: "Activity updated"
        })
        const { navigate } = this.props.navigation;
        navigate('MyActivity');

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }
  render() {
    return (
      <View style={{padding: 10}}>
        <Text>Date: {this.state.activityDate}</Text>
        <TextInput
          style={{height: 40}}
          placeholder="New date (mm/dd/yy)"
          onChangeText={(activityDate) => this.setState({activityDate})}
        />
        <Text>Distance: {this.state.activityDistance} miles</Text>
        <TextInput
          style={{height: 40}}
          keyboardType='numeric'
          placeholder="New distance (miles)"
          onChangeText={(activityDistance) => this.setState({activityDistance})}
        />
        <Text>Duration: {this.state.activityDuration} minutes</Text>
        <TextInput
          style={{height: 40}}
          keyboardType='numeric'
          placeholder="New duration (minutes)"
          onChangeText={(activityDuration) => this.setState({activityDuration})}
        />
        <Button
          title="Update"
          onPress={() => this.updateActivity()}
        />                   
        <Text>{this.state.response}</Text>
      </View>
    );
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
  // Add data for a new user
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

  // Get user's name with user ID
  static listenUserName(userID, callback) {

      let userPath = "/user/" + userID + "/details";

      firebase.database().ref(userPath).on('value', (snapshot) => {

          var userName = "";

          if (snapshot.val()) {
              userName = snapshot.val().userName
          }

          callback(userName)
      });
  }

  // Save a new user activity
  static saveUserActivity(userID, activityDate, activityDuration, activityDistance) {
    let userPath = "/user/" + userID + "/activities";
    
    // push() is used so that a unique ID is automatically generated for each new activity
    return firebase.database().ref(userPath).push({
      activityDate: activityDate,
      activityDistance: activityDistance,
      activityDuration: activityDuration,
      //activitySpeed: activitySpeed,
    });
  }

  // Update an existing user activity
  static updateUserActivity(userID, activityKey, activityDate, activityDuration, activityDistance) {
    let userPath = "/user/" + userID + "/activities/" + activityKey;
    
    // push() is used so that a unique ID is automatically generated for each new activity
    return firebase.database().ref(userPath).update({
      activityDate: activityDate,
      activityDistance: activityDistance,
      activityDuration: activityDuration,
      //activitySpeed: activitySpeed,
    });
  }

  // Get list of activities for a user
  static getUserActivities(userID, callback) {
    var userPath = "/user/" + userID + "/activities";

    var activitiesRef = firebase.database().ref(userPath);
    
    activitiesRef.on('value', (snapshot) => {

        var userActivities = [];

        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          var snapshotKey = childSnapshot.key;

          // Add key to childData
          childData['key'] = snapshotKey;
          userActivities.push(childData);
        })

        // Will return all user activities to the callback function
        console.log("IN FIREBASE:" + userActivities)
        callback(userActivities)
    });    
  }

  // Delete activity from a user
  static deleteActivity(userID, activityKey) {
    var userPath = "/user/" + userID + "/activities/" + activityKey;

    var activityRef = firebase.database().ref(userPath);

    return activityRef.remove();
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
  NewActivity : { screen : AddNewActivityScreen },
  IndividualActivity: { screen : IndividualActivityScreen },
  UpdateActivity: { screen : UpdateActivityScreen },
});

AppRegistry.registerComponent('project30Palos', () => project30Palos);
