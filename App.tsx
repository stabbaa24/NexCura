import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import EducationScreen from './screens/EducationScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import MealAnalysisScreen from './screens/MealAnalysisScreen';
import ManualGlycemieScreen from './screens/ManualGlycemieScreen'; // Import du nouvel écran
import HistoricMealAnalysisScreen from './screens/HistoricMealAnalysisScreen'

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack pour l'écran d'accueil, l'analyse de repas et l'ajout de glycémie
const HomeStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Accueil',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <Icon
            name="menu"
            size={28}
            color="#fff"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.openDrawer()}
          />
        ),
      }}
    />
    <Stack.Screen
      name="MealAnalysis"
      component={MealAnalysisScreen}
      options={{
        title: 'Ajouter un Repas',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen
      name="ManualGlycemie"
      component={ManualGlycemieScreen}
      options={{
        title: 'Ajouter une glycémie',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen
      name="HistoricMealAnalysis"
      component={HistoricMealAnalysisScreen}
      options={{
        title: 'Historique des repas',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

// Stack pour l'écran Calendrier
const CalendarStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        title: 'Calendrier',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <Icon
            name="menu"
            size={28}
            color="#fff"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.openDrawer()}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

// Stack pour l'écran Éducation
const EducationStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Education"
      component={EducationScreen}
      options={{
        title: 'Éducation Santé',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <Icon
            name="menu"
            size={28}
            color="#fff"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.openDrawer()}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

// Stack pour l'écran Profil
const ProfileStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profil',
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <Icon
            name="menu"
            size={28}
            color="#fff"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.openDrawer()}
          />
        ),
      }}
    />
  </Stack.Navigator>
);

// Barre de navigation inférieure
const MainApp = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'TabHome') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'TabCalendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'TabEducation') {
          iconName = focused ? 'book-open-variant' : 'book-open-outline';
        } else if (route.name === 'TabProfile') {
          iconName = focused ? 'account' : 'account-outline';
        } else if (route.name === 'TabMealAnalysis') {
          iconName = focused ? 'food-apple' : 'food-apple-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="TabHome" component={HomeStack} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="TabCalendar" component={CalendarStack} options={{ tabBarLabel: 'Calendrier' }} />
    <Tab.Screen name="TabEducation" component={EducationStack} options={{ tabBarLabel: 'Éducation' }} />
    <Tab.Screen name="TabProfile" component={ProfileStack} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

// Composant de déconnexion modifié
const LogoutScreen = () => {
  useEffect(() => {
    const logout = async () => {
      try {
        await AsyncStorage.removeItem('token');
        // Utiliser la fonction globale pour mettre à jour l'état d'authentification
        if (global.setIsAuthenticated) {
          global.setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
      }
    };

    logout();
  }, []);

  return (
    <View style={styles.center}>
      <Text>Déconnexion en cours...</Text>
    </View>
  );
};

// Navigation par tiroir
const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      swipeEnabled: true, // ✅ autoriser le glissement
      drawerStyle: {
        backgroundColor: '#f5f5f5',
        width: 240,
      },
      drawerActiveTintColor: '#4CAF50',
      drawerInactiveTintColor: 'gray',
      headerShown: false,
    }}
  >
    <Drawer.Screen
      name="MainApp"
      component={MainApp}
      options={{ drawerItemStyle: { height: 0 } }} // ✅ caché du menu
    />
    <Drawer.Screen
      name="Logout"
      component={LogoutScreen}
      options={{
        title: 'Déconnexion',
        drawerIcon: ({ color, size }) => (
          <Icon name="logout" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

  /*<Drawer.Navigator
    screenOptions={{
      drawerStyle: {
        backgroundColor: '#f5f5f5',
        width: 240,
      },
      drawerActiveTintColor: '#4CAF50',
      drawerInactiveTintColor: 'gray',
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: '#fff',
    }}
  >
    <Drawer.Screen
      name="DrawerHome"
      component={MainApp}
      options={{
        title: 'Accueil',
        drawerIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        headerShown: false, // Masquer l'en-tête du Drawer pour cet écran
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
    <Drawer.Screen
      name="DrawerMealAnalysis"
      component={MealAnalysisScreen}
      options={{
        title: 'Analyse de Repas',
        drawerIcon: ({ color, size }) => <Icon name="food-apple" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="DrawerManualGlycemie"
      component={ManualGlycemieScreen}
      options={{
        title: 'Ajouter une glycémie',
        drawerIcon: ({ color, size }) => <Icon name="needle" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="DrawerEducation"
      component={EducationScreen}
      options={{
        title: 'Éducation Santé',
        drawerIcon: ({ color, size }) => <Icon name="book-open-variant" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="DrawerProfile"
      component={ProfileScreen}
      options={{
        title: 'Profil',
        drawerIcon: ({ color, size }) => <Icon name="account" size={size} color={color} />,
      }}
    />

    <Drawer.Screen
      name="Logout"
      component={LogoutScreen}
      options={{
        title: 'Déconnexion',
        drawerIcon: ({ color, size }) => <Icon name="logout" size={size} color={color} />,
      }}
    />*/


// Navigateur d'authentification
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Exposer setIsAuthenticated globalement
  global.setIsAuthenticated = setIsAuthenticated;

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;