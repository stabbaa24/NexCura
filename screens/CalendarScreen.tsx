
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        // Use the same approach as in HomeScreen for API URL
        // For Android emulator, use 10.0.2.2 instead of localhost
        // For iOS simulator, use localhost
        // For physical device, use your computer's actual IP on the network
        const apiUrl = 'http://192.168.91.150:5000/api/user/me'; // Android emulator
        // const apiUrl = 'http://localhost:5000/api/user/me'; // iOS simulator
        // const apiUrl = 'http://YOUR_ACTUAL_IP:5000/api/user/me'; // Physical device
        
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

        // Process the events data
        const allEvents = [
          ...(data.rendezVous || []).map(rdv => ({
            date: rdv.date.split('T')[0],
            time: rdv.date.split('T')[1]?.slice(0, 5) || "00:00",
            type: 'appointment',
            value: `${rdv.type} à ${rdv.lieu}`
          }))
        ];
        setEvents(allEvents);
      } catch (error) {
        console.error("❌ Erreur récupération des événements :", error);
        Alert.alert('Erreur', 'Impossible de récupérer vos événements: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const renderEventIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Icon name="calendar" size={24} color="#4CAF50" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#4CAF50' },
        }}
        theme={{
          todayTextColor: '#4CAF50',
          selectedDayBackgroundColor: '#4CAF50',
          arrowColor: '#4CAF50',
        }}
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>Événements du {selectedDate || "jour"}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <ScrollView>
            {events.filter(e => e.date === selectedDate).map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Text style={styles.timeText}>{event.time}</Text>
                </View>
                <View style={styles.eventContent}>
                  {renderEventIcon(event.type)}
                  <Text style={styles.eventValue}>{event.value}</Text>
                </View>
              </View>
            ))}
            {events.filter(e => e.date === selectedDate).length === 0 && (
              <Text style={styles.noEvents}>Aucun événement ce jour-là</Text>
            )}
          </ScrollView>
        )}
      </View>
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventTime: {
    backgroundColor: '#4CAF50',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  timeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  eventValue: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
  noEvents: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666666',
    fontSize: 16,
  },
});

export default CalendarScreen;