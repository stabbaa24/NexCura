import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_URL } from '../config';

const ManualGlycemieScreen = () => {
  const navigation = useNavigation();
  const [glycemieValue, setGlycemieValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [momentJournee, setMomentJournee] = useState(''); // Ajout du moment de la journée

  // Gérer le changement de date
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    
    // Conserver l'heure actuelle
    const newDate = new Date(currentDate);
    newDate.setHours(date.getHours(), date.getMinutes());
    
    setDate(newDate);
  };

  // Gérer le changement d'heure
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    
    // Conserver la date actuelle
    const newDate = new Date(date);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    
    setDate(newDate);

    // Déterminer automatiquement le moment de la journée en fonction de l'heure
    const hour = newDate.getHours();
    if (hour >= 5 && hour < 10) {
      setMomentJournee('avant_petit_dejeuner');
    } else if (hour >= 10 && hour < 12) {
      setMomentJournee('avant_dejeuner');
    } else if (hour >= 12 && hour < 15) {
      setMomentJournee('apres_dejeuner');
    } else if (hour >= 15 && hour < 19) {
      setMomentJournee('avant_diner');
    } else if (hour >= 19 && hour < 22) {
      setMomentJournee('apres_diner');
    } else {
      setMomentJournee('nuit');
    }
  };

  // Fonction pour sauvegarder la glycémie
  const saveGlycemie = async () => {
    try {
      // Validation des champs
      if (!glycemieValue.trim()) {
        setError('Veuillez entrer une valeur de glycémie');
        return;
      }

      const glycemieNum = parseFloat(glycemieValue);
      if (isNaN(glycemieNum) || glycemieNum <= 0 || glycemieNum > 600) {
        setError('Veuillez entrer une valeur de glycémie valide (entre 1 et 600 mg/dL)');
        return;
      }

      setLoading(true);
      setError('');

      // Obtenir le token d'authentification
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour enregistrer une glycémie');
        setLoading(false);
        return;
      }

      // Préparer les données pour l'envoi
      const glycemieData = {
        valeur: glycemieNum,
        unite: 'mg/dL',
        date: date.toISOString(),
        moment_journee: momentJournee,
        contexte: '',
        commentaire: notes.trim() || ''
      };

      console.log('Envoi des données de glycémie:', glycemieData);

      // Envoyer les données au serveur
      const response = await axios.post(`${API_URL}/api/user/glycemie`, glycemieData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Réponse du serveur:', response.data);
      setSuccess('Glycémie enregistrée avec succès');
      setLoading(false);

      // Réinitialiser les champs
      setGlycemieValue('');
      setNotes('');
      setDate(new Date());

      // Rediriger vers l'écran d'accueil après 1.5 secondes
      setTimeout(() => {
        // Utiliser navigation.reset pour éviter les problèmes de navigation
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabHome' }],
        });
      }, 1000);

    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la glycémie:', err);
      setError('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Options pour le moment de la journée
  const momentOptions = [
    { label: 'Avant petit-déjeuner', value: 'avant_petit_dejeuner' },
    { label: 'Après petit-déjeuner', value: 'apres_petit_dejeuner' },
    { label: 'Avant déjeuner', value: 'avant_dejeuner' },
    { label: 'Après déjeuner', value: 'apres_dejeuner' },
    { label: 'Avant dîner', value: 'avant_diner' },
    { label: 'Après dîner', value: 'apres_diner' },
    { label: 'Nuit', value: 'nuit' }
  ];

  // Fonction pour obtenir le libellé à partir de la valeur
  const getMomentLabel = (value) => {
    const option = momentOptions.find(opt => opt.value === value);
    return option ? option.label : 'Sélectionner';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter une glycémie</Text>
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Valeur de glycémie (mg/dL)</Text>
            <TextInput
              style={styles.input}
              value={glycemieValue}
              onChangeText={setGlycemieValue}
              placeholder="Ex: 120"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date et heure</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={20} color="#4CAF50" />
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="clock-outline" size={20} color="#4CAF50" />
                <Text style={styles.dateTimeText}>
                  {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Moment de la journée</Text>
            <View style={styles.momentContainer}>
              {momentOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.momentButton,
                    momentJournee === option.value && styles.momentButtonActive
                  ]}
                  onPress={() => setMomentJournee(option.value)}
                >
                  <Text 
                    style={[
                      styles.momentButtonText,
                      momentJournee === option.value && styles.momentButtonTextActive
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: Avant le repas, après le sport..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={saveGlycemie}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  momentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  momentButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  momentButtonActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  momentButtonText: {
    fontSize: 14,
    color: '#555',
  },
  momentButtonTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#eee',
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
});

export default ManualGlycemieScreen;