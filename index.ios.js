/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
                  userID: 'None',
                  myPassword: 'None'
                };
  }
  static navigationOptions = {
    title: 'Log into your account',
  };
  render() {
    return (
      <View style={{padding: 10}}>
        <TextInput
          style={{height: 40}}
          placeholder="Enter your user ID"
          onChangeText={(userID) => this.setState({userID})}
        />
        <TextInput secureTextEntry={true}
          style={{height: 40}}
          placeholder="Enter your password"
          onChangeText={(myPassword) => this.setState({myPassword})}
        />
        <Button
          title="Submit"
        />
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
                  name: 'John',
                  lastName: 'Doe',
                  manager: 'None',
                  role: 'Regular User',
                };
  }
  static navigationOptions = {
    title: 'Create New User',
  };
  render() {
    return (
      <View>
        <TextInput
          style={{height: 40}}
          placeholder="Enter user ID"
          onChangeText={(userID) => this.setState({userID})}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Enter name"
          onChangeText={(name) => this.setState({name})}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Enter last name"
          onChangeText={(lastName) => this.setState({lastName})}
        />  
        <TextInput
          style={{height: 40}}
          placeholder="Manager (optional)"
          onChangeText={(manager) => this.setState({manager})}
        />  
        <Picker
          selectedValue={this.state.role}
          onValueChange={(itemValue, itemIndex) => this.setState({role: itemValue})}>
          <Picker.Item label="Regular User" value="Regular" />
          <Picker.Item label="Manager" value="Manager" />
          <Picker.Item label="Admin" value="Admin" />
        </Picker>
        <Button
          title="Create"
        />                      
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
