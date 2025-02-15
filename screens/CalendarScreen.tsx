// CalendarScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState([
    {
      time: '08:00',
      type: 'glucose',
      value: '120 mg/dL',
    },
    {
      time: '12:30',
      type: 'meal',
      value: 'Déjeuner - Salade César',
    },
    {
      time: '14:00',
      type: 'medication',
      value: 'Metformine 500mg',
    },
  ]);

  const renderEventIcon = (type) => {
    switch (type) {
      case 'glucose':
        return <Icon name="needle" size={24} color="#4CAF50" />;
      case 'meal':
        return <Icon name="food-apple" size={24} color="#4CAF50" />;
      case 'medication':
        return <Icon name="pill" size={24} color="#4CAF50" />;
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
        <Text style={styles.eventsTitle}>Événements du jour</Text>
        <ScrollView>
          {events.map((event, index) => (
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
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
  },
  eventTime: {
    marginRight: 16,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  eventContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventValue: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default CalendarScreen;