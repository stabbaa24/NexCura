import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.16:5000/api/auth/login', { // Remplace 192.168.X.X par ton IP locale
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data = await response.json();
      console.log("📌 Réponse API :", data);  // Ajout d'un log pour voir la réponse

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        console.log("✅ Token stocké avec succès !");
        navigation.replace('HomeScreen'); // Redirection après connexion
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Connexion impossible');
      console.error("❌ Erreur de connexion :", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    eventsContainer: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: -20,
    },
    eventsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',
    },
    eventCard: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    eventTime: {
      backgroundColor: '#4CAF50',
      padding: 8,
      borderRadius: 6,
      marginRight: 12,
      justifyContent: 'center',
    },
    timeText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    eventContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    eventValue: {
      marginLeft: 8,
      fontSize: 16,
      color: '#333',
    },
    noEvents: {
      textAlign: 'center',
      color: '#666',
      marginTop: 20,
      fontSize: 16,
    }
  });

export default LoginScreen;
