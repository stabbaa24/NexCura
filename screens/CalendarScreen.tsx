import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
        const response = await fetch('http://192.168.1.16:5000/api/user/me', { // Remplace par ton IP locale
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          }
        });

        const data = await response.json();
        console.log("📌 Données utilisateur :", data);

        if (response.ok) {
          const allEvents = [
            ...(data.rendezVous || []).map(rdv => ({
              date: rdv.date.split('T')[0],
              time: rdv.date.split('T')[1]?.slice(0, 5) || "00:00",
              type: 'appointment',
              value: `${rdv.type} à ${rdv.lieu}`
            }))
          ];
          setEvents(allEvents);
        }
      } catch (error) {
        console.error("❌ Erreur récupération des événements :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedDate]);

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

export default CalendarScreen;
