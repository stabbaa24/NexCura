
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Configure calendar locale
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'fr';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state for new appointment
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [appointmentNote, setAppointmentNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // API URL for user data
      const apiUrl = 'http://192.168.91.150:5000/api/user/me';
      
      console.log('Fetching calendar data from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur serveur');
      }

      const data = await response.json();
      console.log("📌 Données utilisateur :", data);

      // Process appointments
      const appointments = (data.rendezVous || []).map(rdv => ({
        id: rdv._id,
        date: rdv.date.split('T')[0],
        time: rdv.date.split('T')[1]?.slice(0, 5) || "00:00",
        type: 'appointment',
        title: rdv.type,
        location: rdv.lieu,
        note: rdv.note || '',
        value: `${rdv.type} à ${rdv.lieu}`
      }));
      
      // Process medications
      const medications = (data.medicaments || []).flatMap(med => {
        return med.heure_prises.map(time => ({
          id: med._id + time,
          date: new Date().toISOString().split('T')[0], // Today
          time: time,
          type: 'medication',
          title: med.nom,
          dose: med.dose,
          value: `${med.nom} - ${med.dose}`
        }));
      });
      
      // Combine all events
      const allEvents = [...appointments, ...medications];
      setEvents(allEvents);
      
      // Create marked dates for the calendar
      const marks = {};
      allEvents.forEach(event => {
        if (!marks[event.date]) {
          marks[event.date] = { dots: [] };
        }
        
        // Add dot based on event type if not already present
        // Changement des couleurs: bleu pour rendez-vous, vert pour traitements
        const dotColor = event.type === 'appointment' ? '#689D71' : '#4CAF50';
        const existingDotIndex = marks[event.date].dots.findIndex(dot => dot.color === dotColor);
        
        if (existingDotIndex === -1) {
          marks[event.date].dots.push({
            key: event.type,
            color: dotColor
          });
        }
      });
      
      // Add selected date marking
      if (selectedDate) {
        marks[selectedDate] = {
          ...(marks[selectedDate] || {}),
          selected: true,
          selectedColor: '#2196F3'
        };
      }
      
      setMarkedDates(marks);
      setLoading(false);
    } catch (error) {
      console.error("❌ Erreur récupération des événements :", error);
      Alert.alert('Erreur', 'Impossible de récupérer vos événements: ' + error.message);
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
    const newSelectedDate = day.dateString;
    setSelectedDate(newSelectedDate);
    
    // Update marked dates to show selection
    setMarkedDates(prevMarks => {
      const updatedMarks = { ...prevMarks };
      
      // Remove selection from previously selected date
      Object.keys(updatedMarks).forEach(date => {
        if (updatedMarks[date].selected) {
          const { selected, selectedColor, ...rest } = updatedMarks[date];
          updatedMarks[date] = rest;
        }
      });
      
      // Add selection to new date
      updatedMarks[newSelectedDate] = {
        ...(updatedMarks[newSelectedDate] || {}),
        selected: true,
        selectedColor: '#689D71'
      };
      
      return updatedMarks;
    });
  };

  const renderEventIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Icon name="calendar-clock" size={24} color="#2196F3" />;
      case 'medication':
        return <Icon name="pill" size={24} color="#4CAF50" />;
      default:
        return null;
    }
  };

  const addAppointment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté pour ajouter un rendez-vous');
      }
      
      // Combine date and time
      const dateObj = new Date(appointmentDate);
      const timeObj = new Date(appointmentTime);
      
      dateObj.setHours(timeObj.getHours());
      dateObj.setMinutes(timeObj.getMinutes());
      
      // Make sure we're using the correct API endpoint
      const apiUrl = 'http://192.168.91.150:5000/api/rendezvous';
      
      console.log('Sending appointment data:', {
        type: appointmentType,
        lieu: appointmentLocation,
        date: dateObj.toISOString(),
        note: appointmentNote,
        rappel: true
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: appointmentType,
          lieu: appointmentLocation,
          date: dateObj.toISOString(),
          note: appointmentNote,
          rappel: true
        })
      });
      
      // Check for non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('Le serveur a retourné une réponse invalide');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur serveur');
      }
      
      // Reset form and close modal
      setAppointmentType('');
      setAppointmentLocation('');
      setAppointmentDate(new Date());
      setAppointmentTime(new Date());
      setAppointmentNote('');
      setModalVisible(false);
      
      // Refresh events
      fetchEvents();
      
      Alert.alert('Succès', 'Rendez-vous ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rendez-vous:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le rendez-vous: ' + error.message);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setAppointmentTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={{
          todayTextColor: '#689D71',
          arrowColor: '#689D71',
          dotColor: '#689D71',
          selectedDayBackgroundColor: '#689D71',
        }}
      />

      <View style={styles.eventsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.eventsTitle}>
            Événements du {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : "jour"}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="plus" size={24} color="#FFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#689D71" />
        ) : (
          <ScrollView>
            {events
              .filter(e => e.date === selectedDate)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((event, index) => (
                <View key={index} style={styles.eventCard}>
                  <View style={[
                    styles.eventTime, 
                    { backgroundColor: event.type === 'appointment' ? '#689D71' : '#4CAF50' }
                  ]}>
                    <Text style={styles.timeText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventContent}>
                    {renderEventIcon(event.type)}
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventValue}>{event.value}</Text>
                      {event.note && <Text style={styles.eventNote}>{event.note}</Text>}
                    </View>
                  </View>
                </View>
              ))}
            {events.filter(e => e.date === selectedDate).length === 0 && (
              <Text style={styles.noEvents}>Aucun événement ce jour-là</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal for adding new appointment */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un rendez-vous</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type de rendez-vous</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Diabétologue, Ophtalmologue..."
                value={appointmentType}
                onChangeText={setAppointmentType}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Lieu</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Hôpital, Cabinet médical..."
                value={appointmentLocation}
                onChangeText={setAppointmentLocation}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{appointmentDate.toLocaleDateString('fr-FR')}</Text>
                <Icon name="calendar" size={20} color="#689D71" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Heure</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>{appointmentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                <Icon name="clock-outline" size={20} color="#689D71" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={appointmentTime}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Note (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ajouter une note..."
                value={appointmentNote}
                onChangeText={setAppointmentNote}
                multiline={true}
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addAppointment}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  eventsContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#ffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#689D71',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  eventTime: {
    backgroundColor: '#689D71',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  timeText: {
    color: '#ffff',
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  eventDetails: {
    flex: 1,
    marginLeft: 10,
  },
  eventValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  eventNote: {
    fontSize: 14,
    color: '#6666',
    marginTop: 4,
  },
  noEvents: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6666',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#689D71',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#ffff',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;