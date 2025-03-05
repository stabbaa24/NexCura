import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'https://nexcura.onrender.com/api';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
    age: '',
    genre: '',
    type_diabete: '',
    taille: '',
    poids: '',
    objectif_glycemie: {
      min: '70',
      max: '180'
    }
  });

  const handleChange = (name, value) => {
    if (name.includes('.')) {
      // Gérer les objets imbriqués comme objectif_glycemie.min
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  const handleRegister = async () => {
    try {
      // Validation des champs
      if (!formData.email || !formData.mot_de_passe) {
        setError('Email et mot de passe sont requis');
        return;
      }
      
      if (formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      
      if (formData.mot_de_passe.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      
      setLoading(true);
      
      // Préparer les données pour l'API
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        age: formData.age ? parseInt(formData.age) : null,
        genre: formData.genre,
        type_diabete: formData.type_diabete,
        taille: formData.taille ? parseFloat(formData.taille) : null,
        poids: formData.poids ? parseFloat(formData.poids) : null,
        objectif_glycemie: {
          min: formData.objectif_glycemie.min ? parseFloat(formData.objectif_glycemie.min) : 70,
          max: formData.objectif_glycemie.max ? parseFloat(formData.objectif_glycemie.max) : 180
        }
      };
      
      // Appel à l'API pour créer un compte
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Stocker le token dans AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      
      // Mettre à jour l'état d'authentification global
      if (global.setIsAuthenticated) {
        global.setIsAuthenticated(true);
      }
      
      setLoading(false);
      
      // Afficher un message de succès
      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé avec succès!',
        [{ text: 'OK' }]
      );
      
    } catch (err) {
      setLoading(false);
      console.error('Erreur lors de l\'inscription:', err);
      
      // Afficher le message d'erreur du serveur si disponible
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <View style={styles.divider} />
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.rowContainer}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={formData.nom}
                onChangeText={(text) => handleChange('nom', text)}
                placeholder="Votre nom"
              />
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={formData.prenom}
                onChangeText={(text) => handleChange('prenom', text)}
                placeholder="Votre prénom"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Votre email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={styles.input}
              value={formData.mot_de_passe}
              onChangeText={(text) => handleChange('mot_de_passe', text)}
              placeholder="Votre mot de passe"
              secureTextEntry
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmer_mot_de_passe}
              onChangeText={(text) => handleChange('confirmer_mot_de_passe', text)}
              placeholder="Confirmer votre mot de passe"
              secureTextEntry
            />
          </View>
          
          <View style={styles.rowContainer}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Âge</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => handleChange('age', text)}
                placeholder="Votre âge"
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Genre</Text>
              <View style={[styles.input, styles.pickerContainer]}>
                <Picker
                  selectedValue={formData.genre}
                  onValueChange={(value) => handleChange('genre', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sélectionner" value="" />
                  <Picker.Item label="Homme" value="homme" />
                  <Picker.Item label="Femme" value="femme" />
                  <Picker.Item label="Autre" value="autre" />
                </Picker>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations médicales</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Type de diabète</Text>
            <View style={[styles.input, styles.pickerContainer]}>
              <Picker
                selectedValue={formData.type_diabete}
                onValueChange={(value) => handleChange('type_diabete', value)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner" value="" />
                <Picker.Item label="Type 1" value="Type 1" />
                <Picker.Item label="Type 2" value="Type 2" />
                <Picker.Item label="Gestationnel" value="Gestationnel" />
                <Picker.Item label="Autre" value="Autre" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.rowContainer}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Taille (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.taille}
                onChangeText={(text) => handleChange('taille', text)}
                placeholder="Votre taille en cm"
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Poids (kg)</Text>
              <TextInput
                style={styles.input}
                value={formData.poids}
                onChangeText={(text) => handleChange('poids', text)}
                placeholder="Votre poids en kg"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Text style={styles.groupLabel}>Objectif glycémie (mg/dL)</Text>
          <View style={styles.rowContainer}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Minimum</Text>
              <TextInput
                style={styles.input}
                value={formData.objectif_glycemie.min}
                onChangeText={(text) => handleChange('objectif_glycemie.min', text)}
                placeholder="Valeur minimum"
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Maximum</Text>
              <TextInput
                style={styles.input}
                value={formData.objectif_glycemie.max}
                onChangeText={(text) => handleChange('objectif_glycemie.max', text)}
                placeholder="Valeur maximum"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Déjà un compte? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  divider: {
    height: 3,
    width: 60,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#444',
  },
  groupLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    padding: 0,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default RegisterScreen;