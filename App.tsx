import { StatusBar } from 'expo-status-bar';
import { Alert, Button, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomePage from './src/Components/HomePage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/Components/HomePage';
import HistoryPage from './src/Components/HistoryPage';


function LoginPage({ route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(route.params || false);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const navigation = useNavigation();

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password).then(() => {
      Alert.alert('New user created successfully');
    }).catch(() => {
      Alert.alert('Email already in use');
    });
  }

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password).then(() => {
      navigation.navigate('Home', darkMode);
    }).catch(error => {
      Alert.alert(error);
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const containerStyle = darkMode ? styles.containerDark : styles.containerLight;
  const inputStyle = darkMode ? styles.inputDark : styles.inputLight;
  const buttonTitle = darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  const welcomeTextStyle = darkMode ? styles.welcomeTextDark : styles.welcomeTextLight;
  const buttonStyle = darkMode ? styles.buttonDark : styles.buttonLight;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={welcomeTextStyle}>Welcome</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={{ paddingBottom: 10 }}>
        <Button title="Login" onPress={handleLogin} />
      </View>

      <Button title="Sign-in" color={'grey'} onPress={handleSignUp} />
      <TouchableOpacity onPress={toggleDarkMode}>
        <Text style={buttonStyle}>{buttonTitle}</Text>
      </TouchableOpacity>
    </View>
  )
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const initialRouteName = 'Login';
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name='Login' component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name='Home' component={HomePage} />
        <Stack.Screen name='History' component={HistoryPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: windowWidth,
    height: windowHeight
  },
  containerLight: {
    backgroundColor: '#FFF'
  },
  containerDark: {
    backgroundColor: '#191828'
  },
  input: {
    width: windowWidth * 0.8,
    height: 40,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10
  },
  inputLight: {
    backgroundColor: '#FFF',
    color: '#000',
    borderColor: '#888'
  },
  inputDark: {
    backgroundColor: '#242526',
    color: '#FFF'
  },
  buttonLight: {
    marginTop: 10,
    color: '#888',
    textDecorationLine: 'underline'
  },
  buttonDark: {
    marginTop: 10,
    color: '#FFF',
    textDecorationLine: 'underline'
  },
  welcomeTextLight: {
    fontSize: windowWidth * 0.06,
    color: '#000',
    marginBottom: windowHeight * 0.03
  },
  welcomeTextDark: {
    fontSize: windowWidth * 0.06,
    color: '#FFF',
    marginBottom: windowHeight * 0.03
  }
});
