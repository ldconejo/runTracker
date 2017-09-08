/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import * as firebase from 'firebase';
import React, {Component} from 'react';
import { DateUtils } from "react-day-picker";
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
          title="Add new user"
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
                  userRole: 'None',
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

          // Determine user access level, based on role assigned in database
          await Database.getUserRole(userID, (userRole) => {
              this.setState({
                  userRole: userRole,
                  response: userRole,
              });

            switch(this.state.userRole) {
              case 'Regular User':
                navigate('RegularUser');
                break;
              case 'Admin':
                navigate('AdminUser');
                break;
              case 'Manager':
                navigate('ManagerUser');
                break;
            }
          });

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
          autoCorrect = {false}
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
                  userManagerKey: 'None',
                  userRole: 'Regular User',
                  response: '',
                  isLoading: true,
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
            Database.setUserData(this.state.userID, this.state.userEmail, this.state.userName, this.state.userLastName, this.state.userManager, this.state.userManagerKey, this.state.userRole);

            // If a manager has been selected, add trainee
            if(this.state.userManager != 'None') {
              Database.addTraineeToManager(this.state.userManagerKey, this.state.userID, this.state.userEmail);
            }

            // Go back to the previous screen
            const { goBack } = this.props.navigation;
            goBack();

        } catch (error) {
            this.setState({
                response: error.toString()
            })
        }

    }
    async getManagerList(){
    try {
        Database.getListOfManagers((managerList) => {
          this.state.managerList = managerList
          this.setState({
            isLoading : false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }
  render() {
    if (this.state.isLoading){
      this.getManagerList();
      return <View><Text>Loading...</Text></View>;
    }
    return (
      <View style={{padding: 10}}>
        <TextInput
          style={{height: 40}}
          keyboardType="email-address"
          autoCapitalize = 'none'
          autoCorrect = {false}
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
        <Text>Manager: {this.state.userManager}</Text>
        <FlatList
          data={this.state.managerList}
          renderItem={({item}) => 
            <Button
              onPress={() => this.setState({userManager : item.details.userEmail, userManagerKey : item.key })}
              title={item.details.userEmail}
            /> }
        />
        <Button
          onPress={() => this.setState({userManager : 'None'})}
          title='None'
        />
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
      this.userName = userName;  
    });
    
  }
  static navigationOptions = {
    title: 'Welcome to 30Palos!'
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Button
          onPress={() => navigate('NewActivity', { userID : this.state.userID })}
          title="Add New Activity"
        />
        <Button
          onPress={() => navigate('MyActivity', { userID : this.state.userID })}
          title="My Activity"
        />
      </View>
    );
  }
}

// Manager user screen
class ManagerUserScreen extends React.Component {
  static navigationOptions = {
    title: 'Manager',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Button
          onPress={() => navigate('UsersFromManager', { managerID : firebase.auth().currentUser.uid })}
          title="View trainees"
        />
      </View>
    );
  }
}

// Admin user screen
class AdminUserScreen extends React.Component {
  static navigationOptions = {
    title: 'Admin',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Button
          onPress={() => navigate('AllUsersView')}
          title="View user"
        />
        <Button
          onPress={() => navigate('AllUsers')}
          title="Edit user"
        />
      </View>
    )
  }
}

// My activity screen
class MyActivityScreen extends React.Component {
  static navigationOptions = {
    title: 'Activity Information',
  };
  constructor(props) {
    super(props);
    this.state = {
                  userID: 'None',
                  userActivities: [],
                  isLoading: true,
                };
    // Get userID
    this.state.userID = this.props.navigation.state.params.userID
  } 

  async getUserActivities(){
    try {
        Database.getUserActivities(this.state.userID, (userActivities) => {
          this.state.userActivities = userActivities
          this.setState({
            // This is required to trigger a re-render once the data has been loaded
            isLoading: false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getUserActivities();
      return <View><Text>Loading...</Text></View>;
    }
    return (
      <View>
        <Button
          onPress={() => navigate('ActivityByRange', {userID : this.state.userID})}
          title="View by date range"
        />
        <Button
          onPress={() => navigate('MyActivityPerWeek', {userID : this.state.userID})}
          title="View weekly data"
        />
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

// My activity per week screen
class MyActivityPerWeekScreen extends React.Component {
  static navigationOptions = {
    title: 'Weekly Report',
  };
  constructor(props) {
    super(props);
    this.state = {
                  userID: 'None',
                  userActivities: [],
                  isLoading: true,
                };
    // Get userID
    this.state.userID = this.props.navigation.state.params.userID;
  }

  async getUserActivities(){
    try {
        Database.getActivityPerWeek(this.state.userID, (userActivities) => {
          this.state.userActivities = userActivities
          this.setState({
            // This is required to trigger a re-render once the data has been loaded
            isLoading: false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getUserActivities();
      return <View><Text>Loading...</Text></View>;
    }
    return (
      <View>
        <FlatList
          data={this.state.userActivities}
          renderItem={({item}) => 
            <Text>Wk:{item.week.weekNumber}, {item.week.totalDistance} miles, {item.week.averageSpeed} minutes / mile</Text>
          }
        />
      </View>
    )
  }

}

// My activity range screen, for searches by date range
class MyActivityByRangeScreen extends React.Component {
  static navigationOptions = {
    title: 'Activity Information',
  };
  constructor(props) {
    super(props);
    this.state = {
                  userID: 'None',
                  startDate: 'None',
                  endDate: 'None',
                  userActivities: [],
                  isLoading: true,
                };
    // Get userID
    this.state.userID = this.props.navigation.state.params.userID;

    // Get date params
    this.state.startDate = this.props.navigation.state.params.startDate;
    this.state.endDate = this.props.navigation.state.params.endDate;

  } 

  async getUserActivities(){
    try {
        Database.getUserActivitiesByRange(this.state.userID, this.state.startDate, this.state.endDate, (userActivities) => {
          this.state.userActivities = userActivities
          this.setState({
            // This is required to trigger a re-render once the data has been loaded
            isLoading: false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getUserActivities();
      return <View><Text>Loading...</Text></View>;
    }
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

// All users screen (admin)
class AllUsersScreen extends React.Component {
  static navigationOptions = {
    title: 'Select user to edit',
  };
  constructor(props) {
    super(props);
    this.state = {
                  userList: [],
                  isLoading: true,
                };
  } 

  async getUserList(){
    try {
        Database.getListOfUsers((userList) => {
          this.state.userList = userList
          this.setState({
            // This is required to trigger a re-render once the data has been loaded
            isLoading: false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getUserList();
      return <View><Text>Loading...</Text></View>;
    }
    return (
      <View>
        <FlatList
          data={this.state.userList}
          renderItem={({item}) => 
            <Button
              onPress={() => navigate('EditUser', {userParams : item})}
              title={item.details.userEmail}
        /> }
        />
      </View>
    )
  }
}

// All users view screen (admin)
class AllUsersViewScreen extends React.Component {
  static navigationOptions = {
    title: 'Select user to view',
  };
  constructor(props) {
    super(props);
    this.state = {
                  userList: [],
                  isLoading: true,
                };
  } 

  async getUserList(){
    try {
        Database.getListOfUsers((userList) => {
          this.state.userList = userList
          this.setState({
            // This is required to trigger a re-render once the data has been loaded
            isLoading: false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getUserList();
      return <View><Text>Loading...</Text></View>;
    }
    return (
      <View>
        <FlatList
          data={this.state.userList}
          renderItem={({item}) => 
            <Button
              onPress={() => navigate('MyActivity', { userID : item.key })}
              title={item.details.userEmail}
        /> }
        />
      </View>
    )
  }
}

// All users from one manager screen
class AllUsersFromManagerScreen extends React.Component {
  static navigationOptions = {
    title: 'Select user to view',
  };
  constructor(props) {
    super(props);
    this.state = {
                  userList: [],
                  isLoading: true,
                  managerID : 'None',
                };
  } 

  async getUserList(){
    try {
        this.state.managerID = this.props.navigation.state.params.managerID;
        Database.getListOfTraineesPerManager(this.state.managerID, (userList) => {
          this.state.userList = userList
          this.setState({
            // This is required to trigger a re-render once the data has been loaded
            isLoading: false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getUserList();
      return <View><Text>Loading...</Text></View>;
    }
    return (
      <View>
        <FlatList
          data={this.state.userList}
          renderItem={({item}) => 
            <Button
              onPress={() => navigate('MyActivity', { userID : item.traineeID})}
              title={item.traineeEmail}
        /> }
        />
      </View>
    )
  }
}

class EditUserScreen extends React.Component {
  static navigationOptions = {
    title: 'Edit user',
  };
  constructor(props) {
    super(props);
    this.state = {
      userID: 'None',
      userEmail: 'None',
      userLastName: 'None',
      userName : 'None',
      userManager : 'None',
      userManagerKey : 'None',
      prevManagerKey : 'None',
      userRole : 'None',
      managerList : [],
      response : '',
      isLoading : true,
    }
    // Get userID
    this.state.userID = this.props.navigation.state.params.userParams.key;
    this.state.userEmail = this.props.navigation.state.params.userParams.details.userEmail;
    this.state.userLastName = this.props.navigation.state.params.userParams.details.userLastName;
    this.state.userName = this.props.navigation.state.params.userParams.details.userName;
    this.state.userManager = this.props.navigation.state.params.userParams.details.userManager;
    this.state.userManagerKey = this.props.navigation.state.params.userParams.details.userManagerKey;
    this.state.prevManagerKey =  this.props.navigation.state.params.userParams.details.userManagerKey;
    this.state.userRole = this.props.navigation.state.params.userParams.details.userRole;

  }  
    async getManagerList(){
    try {
        Database.getListOfManagers((managerList) => {
          this.state.managerList = managerList
          this.setState({
            isLoading : false
          })
        });

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }
  // Triggers update to the database
  async updateUser() {
    try {
        if(this.state.prevManagerKey != this.state.userManagerKey) {
          if(this.state.prevManagerKey != 'None'){
            // Delete user from previous manager
            Database.removeTraineeFromManager(this.state.prevManagerKey, this.state.userID)
          }

          if(this.state.userManagerKey != 'None'){
            // Add user to new manager
            Database.addTraineeToManager(this.state.userManagerKey, this.state.userID, this.state.userEmail);
          }
        }
        Database.updateUser(this.state.userID, this.state.userEmail, this.state.userLastName, this.state.userName, this.state.userManager, this.state.userManagerKey, this.state.userRole );

        this.setState({
            response: "User updated"
        })
        const { goBack } = this.props.navigation;
        goBack();

    } catch (error) {
        this.setState({
            response: error.toString()
        })
    }
  }  
  // Handle deletion of user
  async deleteUser() {
    const { goBack } = this.props.navigation;
    Alert.alert(
      'Delete User',
      'This user will be deleted. Are you sure?',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Delete', onPress: () => {
                                          Database.deleteUser(this.state.userID);
                                          Alert.alert(
                                            '30Palos',
                                            'User Deleted',
                                            [
                                              {text: 'OK', onPress: () => goBack()},
                                            ]
                                          )
                                        }},
      ],
      { cancelable: false }
    )
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading){
      this.getManagerList();
      return <View><Text>Loading...</Text></View>;
    }
    return(
      <View  style={{padding: 10}}>
        <Text>E-mail: {this.state.userEmail}</Text>
        <TextInput
          style={{height: 40}}
          keyboardType="email-address"
          autoCapitalize = 'none'
          placeholder="New email"
          onChangeText={(userEmail) => this.setState({userEmail})}
        />
        <Text>Last Name: {this.state.prevManagerKey}</Text>
        <TextInput
          style={{height: 40}}
          placeholder="New last name"
          onChangeText={(userLastName) => this.setState({userLastName})}
        />
        <Text>Name: {this.state.userManagerKey}</Text>
        <TextInput
          style={{height: 40}}
          placeholder="New name"
          onChangeText={(userName) => this.setState({userName})}
        />
        <Text>Manager: {this.state.userManager}</Text>
        <FlatList
          data={this.state.managerList}
          renderItem={({item}) => 
            <Button
              onPress={() => this.setState({userManager : item.details.userEmail, userManagerKey : item.key })}
              title={item.details.userEmail}
            /> }
        />
        <Button
          onPress={() => this.setState({userManager : 'None', userManagerKey : 'None'})}
          title='None'
        />
        <Picker
          selectedValue={this.state.userRole}
          mode="dropdown"
          onValueChange={(itemValue, itemIndex) => this.setState({userRole: itemValue})}>
          <Picker.Item label="Regular User" value="Regular User" />
          <Picker.Item label="Manager" value="Manager" />
          <Picker.Item label="Admin" value="Admin" />
        </Picker>
        <Button
          onPress={() => this.updateUser()}
          title="Update"
        />
        <Button
          onPress={() => this.deleteUser()}
          title="Delete User"
        />
        <Text>{this.state.response}</Text>
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
      activitySpeedMinutes : 'None',
      activitySpeedSeconds : 'None',
    }
    // Get userID
    this.state.userID = this.props.navigation.state.params.userID;

    // Get activity parameters
    this.state.activityDate = this.props.navigation.state.params.activityParams.activityDate;
    this.state.activityDistance = this.props.navigation.state.params.activityParams.activityDistance;
    this.state.activityDuration = this.props.navigation.state.params.activityParams.activityDuration;
    
    // Calculate speed
    var floatDistance = parseFloat(this.state.activityDistance);
    var floatDuration = parseFloat(this.state.activityDuration);

    var floatSpeed = floatDuration / floatDistance;
    
    var intMinutes = parseInt(floatSpeed);

    var floatMinutes = parseFloat(intMinutes);

    var floatSeconds = floatSpeed - floatMinutes;

    floatSeconds = floatSeconds * 60;

    var intSeconds = parseInt(floatSeconds);

    this.state.activitySpeedMinutes = String(intMinutes);

    var strSeconds = String(intSeconds);

    if(strSeconds.length == 1){
      strSeconds = "0" + strSeconds;
    }

    this.state.activitySpeedSeconds = strSeconds;

    // Get activityKey
    this.state.activityKey = this.props.navigation.state.params.activityParams.key;
  }
  // Handle deletion of activity
  async deleteActivity() {
    const { goBack } = this.props.navigation;
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
                                              {text: 'OK', onPress: () => goBack()},
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
        <Text>Speed: {this.state.activitySpeedMinutes}:{this.state.activitySpeedSeconds} minutes / mile</Text>
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
        const { goBack } = this.props.navigation;
        goBack();

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

// For updates of regular user activity
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
    this.state.userID = this.props.navigation.state.params.userID;

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
        navigate('MyActivity', { userID : this.state.userID });

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
          keyboardType='numbers-and-punctuation'
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

// To view activities by range of dates
class ActivityByRangeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
                  userID : 'None',
                  startDate: 'None',
                  endDate: 'None',
                  response: '',
                };
    // Get userID
    this.state.userID = this.props.navigation.state.params.userID;
  }  
  static navigationOptions = {
    title: 'View Activity by Range',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={{padding: 10}}>
        <TextInput
          style={{height: 40}}
          keyboardType='numbers-and-punctuation'
          placeholder="Start date (mm/dd/yy)"
          onChangeText={(startDate) => this.setState({startDate})}
        />
        <TextInput
          style={{height: 40}}
          keyboardType='numbers-and-punctuation'
          placeholder="End date (mm/dd/yy)"
          onChangeText={(endDate) => this.setState({endDate})}
        />
        <Button
          title="Show"
          onPress={() => navigate('MyActivityByRange', { userID : this.state.userID, startDate : this.state.startDate, endDate : this.state.endDate })}
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
///////////////////////
// Database operations
///////////////////////
class Database {
  // Add data for a new user
  static setUserData(userID, userEmail, userName, userLastName, userManager, userManagerKey, userRole) {
    let userPath = "/user/" + userID + "/details";
    return firebase.database().ref(userPath).set({
            userEmail: userEmail,
            userName: userName,
            userLastName: userLastName,
            userManager: userManager,
            userManagerKey: userManagerKey,
            userRole: userRole,
        })
  }

  // Get user's role with user ID
  static getUserRole(userID, callback) {
    let userPath = "/user/" + userID + "/details";

    firebase.database().ref(userPath).on('value', (snapshot) => {

      var userRole = "";

      if (snapshot.val()) {
        userRole = snapshot.val().userRole
      }

      callback(userRole)
    });
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
    
    return firebase.database().ref(userPath).update({
      activityDate: activityDate,
      activityDistance: activityDistance,
      activityDuration: activityDuration,
    });
  }

  // Update an existing user
  static updateUser(userID, userEmail, userLastName, userName , userManager, userManagerKey, userRole) {
    let userPath = "/user/" + userID + "/details/";
    
    return firebase.database().ref(userPath).update({
      userEmail: userEmail,
      userLastName: userLastName,
      userName: userName,
      userManager: userManager,
      userManagerKey: userManagerKey,
      userRole: userRole,
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
        callback(userActivities)
    });    
  }

  // Get list of activities for a user on range of dates
  static getUserActivitiesByRange(userID, startDate, endDate, callback) {
    var userPath = "/user/" + userID + "/activities";

    var activitiesRef = firebase.database().ref(userPath);

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    
    activitiesRef.on('value', (snapshot) => {

        var userActivities = [];

        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          var snapshotKey = childSnapshot.key;

          // Check if activity is within range
          var activityDate = new Date(childData['activityDate']);

          if ((activityDate >= startDate)&&(activityDate <= endDate)) {
            // Add key to childData
            childData['key'] = snapshotKey;
            userActivities.push(childData);
          }
        })

        // Will return all user activities to the callback function
        callback(userActivities)
    });    
  }

  // Get list of manager users
  static getListOfManagers(callback) {
    var listPath = "/user";

    var listRef = firebase.database().ref(listPath);

    listRef.on('value', (snapshot) => {
      var userList = [];

      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();

        // Check if the user is a manager
        if(childData['details']['userRole'] == 'Manager'){
          var snapshotKey = childSnapshot.key;

          // Add key to childData
          childData['key'] = snapshotKey;
          userList.push(childData);
        }
      })

      // Return list of users to the callback function
      callback(userList)
    });
  }  

  // Delete activity from a user
  static deleteActivity(userID, activityKey) {
    var userPath = "/user/" + userID + "/activities/" + activityKey;

    var activityRef = firebase.database().ref(userPath);

    return activityRef.remove();
  }

  // Get list of total mileage and average speed per week per user
  static getActivityPerWeek(userID, callback) {
    var userPath = "/user/" + userID + "/activities";

    var activitiesRef = firebase.database().ref(userPath);
    
    activitiesRef.on('value', (snapshot) => {

      var weeklyStats = [];

      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();

        var currentDate = new Date(childData['activityDate']);
        var currentDistance = parseFloat(childData['activityDistance']);
        var currentDuration = parseFloat(childData['activityDuration']);

        // Calculate week
        var weekNumber = DateUtils.getWeekNumber(currentDate);

        // Iterate
        var weekExists = false;
        var weekIndex = 0;
        for (index = 0; index < weeklyStats.length; ++index) {
          if(weeklyStats[index].week.weekNumber == weekNumber){
            weekExists = true;
            weekIndex = index;
            break;
          }
        }
        
        if(weekExists) {
          weeklyStats[weekIndex].week.totalDistance += currentDistance;
          weeklyStats[weekIndex].week.totalDuration += currentDuration;
          weeklyStats[weekIndex].week.averageSpeed = Database._calculateSpeed(weeklyStats[weekIndex].week.totalDistance, weeklyStats[weekIndex].week.totalDuration)
        }
        else {
          var averageSpeed = Database._calculateSpeed(currentDistance, currentDuration)
          var newEntry = { "week": { "weekNumber" : weekNumber, "totalDistance" : currentDistance, "totalDuration" : currentDuration, "averageSpeed" : averageSpeed }};
          weeklyStats.push(newEntry);
        }

      })

        // Will return all user activities to the callback function
        callback(weeklyStats)
    });    
  }

  static _calculateSpeed(floatDistance, floatDuration) {

    var floatSpeed = floatDuration / floatDistance;
    
    var intMinutes = parseInt(floatSpeed);

    var floatMinutes = parseFloat(intMinutes);

    var floatSeconds = floatSpeed - floatMinutes;

    floatSeconds = floatSeconds * 60;

    var intSeconds = parseInt(floatSeconds);

    var strMinutes = String(intMinutes);

    var strSeconds = String(intSeconds);

    if(strSeconds.length == 1){
      strSeconds = "0" + strSeconds;
    }

    var finalString = strMinutes + ":" + strSeconds;

    return finalString;
  }

  // Delete user
  static deleteUser(userID) {
    var userPath = "/user/" + userID;

    var userRef = firebase.database().ref(userPath);

    return userRef.remove();
  }

  // Get a list of users
  // This will return both regular users, managers and other admins
  static getListOfUsers(callback) {
    var listPath = "/user";

    var listRef = firebase.database().ref(listPath);

    listRef.on('value', (snapshot) => {
      var userList = [];

      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        var snapshotKey = childSnapshot.key;

        // Add key to childData
        childData['key'] = snapshotKey;
        userList.push(childData);
      })

      // Return list of users to the callback function
      callback(userList)
    });
  }

  // Add trainee to manager
  static addTraineeToManager(managerID, traineeID, traineeEmail) {
    let userPath = "/user/" + managerID + "/trainees";
    
    // push() is used so that a unique ID is automatically generated for each new trainee
    return firebase.database().ref(userPath).push({
      traineeID: traineeID,
      traineeEmail: traineeEmail,
    });   
  }

  // Remove trainee from manager
  static removeTraineeFromManager(managerID, traineeID) {
    let listPath = "/user/" + managerID + "/trainees";
  
    var listRef = firebase.database().ref(listPath);

    listRef.on('value', (snapshot) => {

      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        var snapshotKey = childSnapshot.key;

        if(childData['traineeID'] == traineeID){
          var userPath = "/user/" + managerID + "/trainees/" + snapshotKey;
          var userRef = firebase.database().ref(userPath);
          return userRef.remove();
        }
      })
    });
  }

  // Get list of trainees per manager
  static getListOfTraineesPerManager(managerID, callback) {
    var listPath = "/user/" + managerID + "/trainees/";

    var listRef = firebase.database().ref(listPath);

    listRef.on('value', (snapshot) => {
      var userList = [];

      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        var snapshotKey = childSnapshot.key;

        // Add key to childData
        childData['key'] = snapshotKey;
        userList.push(childData);
      })

      // Return list of users to the callback function
      callback(userList)
    });
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
  MyActivityByRange : { screen : MyActivityByRangeScreen },
  NewActivity : { screen : AddNewActivityScreen },
  IndividualActivity: { screen : IndividualActivityScreen },
  UpdateActivity: { screen : UpdateActivityScreen },
  AllUsers : { screen : AllUsersScreen },
  EditUser : { screen : EditUserScreen },
  UsersFromManager : { screen : AllUsersFromManagerScreen },
  AllUsersView : { screen : AllUsersViewScreen },
  ActivityByRange : { screen : ActivityByRangeScreen},
  MyActivityPerWeek : { screen : MyActivityPerWeekScreen},
});

console.disableYellowBox = true;

AppRegistry.registerComponent('project30Palos', () => project30Palos);
