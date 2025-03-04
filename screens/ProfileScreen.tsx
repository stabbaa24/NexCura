import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  // État pour les données utilisateur
  const [userData, setUserData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmer_mot_de_passe: '',
    type_diabete: '',
    taille: '',
    poids: '',
    objectif_glycemie: {
    min: '',
    max: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Récupérer les données utilisateur au chargement du composant
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
    setError('Vous devez être connecté pour accéder à cette page');
    setLoading(false);
    return;
    }

    // Utiliser la même URL que dans HomeScreen
    const apiUrl = 'https://nexcura.onrender.com/api/user/me';
    
    console.log('Fetching from:', apiUrl);
    console.log('Using token:', token.substring(0, 10) + '...');
    
    const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur serveur');
    }

    const data = await response.json();
    console.log('User data received:', data);

    // Mettre à jour l'état avec les données utilisateur, en convertissant les nombres en chaînes pour les inputs
    setUserData({
    ...userData,
    nom: data.nom || '',
    email: data.email || '',
    mot_de_passe: '', // Ne pas afficher le mot de passe
    type_diabete: data.type_diabete || '',
    taille: data.taille ? data.taille.toString() : '',
    poids: data.poids ? data.poids.toString() : '',
    objectif_glycemie: {
    min: data.objectif_glycemie?.min ? data.objectif_glycemie.min.toString() : '',
    max: data.objectif_glycemie?.max ? data.objectif_glycemie.max.toString() : ''
    }
    });
    
    setLoading(false);
    } catch (err) {
    console.error('Erreur lors de la récupération des données utilisateur:', err);
    setError('Impossible de récupérer vos informations. Veuillez réessayer.');
    setLoading(false);
    }
  };

  // Fonction pour mettre à jour les données utilisateur
  const updateProfile = async () => {
    try {
    // Validation du mot de passe
    if (userData.nouveau_mot_de_passe) {
    if (userData.nouveau_mot_de_passe !== userData.confirmer_mot_de_passe) {
    setError('Les mots de passe ne correspondent pas');
    return;
    }
    if (userData.nouveau_mot_de_passe.length < 6) {
    setError('Le mot de passe doit contenir au moins 6 caractères');
    return;
    }
    }

    // Préparer les données pour l'API
    const dataToUpdate = {
    nom: userData.nom,
    email: userData.email,
    type_diabete: userData.type_diabete,
    taille: userData.taille ? parseFloat(userData.taille) : undefined,
    poids: userData.poids ? parseFloat(userData.poids) : undefined,
    objectif_glycemie: {
    min: userData.objectif_glycemie.min ? parseFloat(userData.objectif_glycemie.min) : undefined,
    max: userData.objectif_glycemie.max ? parseFloat(userData.objectif_glycemie.max) : undefined
    }
    };

    // Ajouter le mot de passe seulement si l'utilisateur veut le changer
    if (userData.nouveau_mot_de_passe) {
    dataToUpdate.mot_de_passe_actuel = userData.mot_de_passe;
    dataToUpdate.nouveau_mot_de_passe = userData.nouveau_mot_de_passe;
    }

    const token = await AsyncStorage.getItem('token');
    
    // Utiliser la même base d'URL que pour la récupération
    const apiUrl = 'https://nexcura.onrender.com/api/user/update';
    
    const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dataToUpdate)
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
    }

    const result = await response.json();
    
    setSuccess('Profil mis à jour avec succès');
    
    // Effacer les champs de mot de passe
    setUserData({
    ...userData,
    mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmer_mot_de_passe: ''
    });
    
    // Effacer le message de succès après 3 secondes
    setTimeout(() => {
    setSuccess('');
    }, 3000);
    } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    setError(err.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  // Gérer les changements d'input
  const handleChange = (name, value) => {
    if (name.includes('.')) {
    // Gérer les objets imbriqués comme objectif_glycemie.min
    const [parent, child] = name.split('.');
    setUserData({
    ...userData,
    [parent]: {
    ...userData[parent],
    [child]: value
    }
    });
    } else {
    setUserData({
    ...userData,
    [name]: value
    });
    }
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  if (loading) {
    return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
    );
  }

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.container}
    >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <View style={styles.divider} />
      </View>
    
      {error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      {success ? (
        <View style={styles.messageContainer}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}
    
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={userData.nom}
            onChangeText={(text) => handleChange('nom', text)}
            placeholder="Votre nom"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Votre email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sécurité</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Mot de passe actuel</Text>
          <Text style={styles.sublabel}>(requis pour changer le mot de passe)</Text>
          <TextInput
            style={styles.input}
            value={userData.mot_de_passe}
            onChangeText={(text) => handleChange('mot_de_passe', text)}
            placeholder="Mot de passe actuel"
            secureTextEntry
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nouveau mot de passe</Text>
          <Text style={styles.sublabel}>(laisser vide pour ne pas changer)</Text>
          <TextInput
            style={styles.input}
            value={userData.nouveau_mot_de_passe}
            onChangeText={(text) => handleChange('nouveau_mot_de_passe', text)}
            placeholder="Nouveau mot de passe"
            secureTextEntry
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            value={userData.confirmer_mot_de_passe}
            onChangeText={(text) => handleChange('confirmer_mot_de_passe', text)}
            placeholder="Confirmer le mot de passe"
            secureTextEntry
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations médicales</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Type de diabète</Text>
          <TextInput
            style={styles.input}
            value={userData.type_diabete}
            onChangeText={(text) => handleChange('type_diabete', text)}
            placeholder="Type 1, Type 2, etc."
          />
        </View>
        
        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Taille (cm)</Text>
            <TextInput
              style={styles.input}
              value={userData.taille}
              onChangeText={(text) => handleChange('taille', text)}
              placeholder="Votre taille en cm"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              value={userData.poids}
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
              value={userData.objectif_glycemie.min}
              onChangeText={(text) => handleChange('objectif_glycemie.min', text)}
              placeholder="Valeur minimum"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Maximum</Text>
            <TextInput
              style={styles.input}
              value={userData.objectif_glycemie.max}
              onChangeText={(text) => handleChange('objectif_glycemie.max', text)}
              placeholder="Valeur maximum"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={updateProfile}>
        <Text style={styles.buttonText}>Mettre à jour le profil</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
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
  sublabel: {
    fontSize: 12,
    marginBottom: 5,
    color: '#777',
    fontStyle: 'italic',
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
    marginBottom: 40,
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
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  successText: {
    color: '#388E3C',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  }
});

export default ProfileScreen;