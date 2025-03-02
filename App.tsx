
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import LoginScreen from './screens/LoginScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Barre de navigation inférieure
const MainApp = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = route.name === 'TabHome' ? 'home' : 'calendar';
        return <Icon name={focused ? iconName : `${iconName}-outline`} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false, // Supprime la top bar
    })}
  >
    <Tab.Screen 
      name="TabHome" 
      component={HomeScreen} 
      options={{ tabBarLabel: 'Accueil' }} 
    />
    <Tab.Screen 
      name="TabCalendar" 
      component={CalendarScreen} 
      options={{ tabBarLabel: 'Calendrier' }}
    />
  </Tab.Navigator>
);

// Composant vide pour la déconnexion
const LogoutScreen = ({ navigation }) => {
  useEffect(() => {
    const logout = async () => {
      try {
        await AsyncStorage.removeItem('token');
        // Force refresh of the app state
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
      }
    };
    
    logout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Déconnexion en cours...</Text>
    </View>
  );
};

// Navigation par tiroir (sidenav)
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f5f5f5',
          width: 240,
        },
        drawerActiveTintColor: '#4CAF50',
        drawerInactiveTintColor: 'gray',
      }}
    >
      <Drawer.Screen
        name="DrawerHome"
        component={MainApp}
        options={{
          title: 'Accueil',
          drawerIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="DrawerCalendar"
        component={CalendarScreen}
        options={{
          title: 'Calendrier',
          drawerIcon: ({ color, size }) => <Icon name="calendar" size={size} color={color} />,
        }}
      />
      {/* Ajout du bouton de déconnexion */}
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          title: 'Déconnexion',
          drawerIcon: ({ color, size }) => <Icon name="logout" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log("📌 Token récupéré :", token);
      setIsAuthenticated(!!token);
    };
    checkLogin();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;