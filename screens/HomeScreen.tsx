// HomeScreen.tsx
import React, { useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  const [currentGlucose, setCurrentGlucose] = useState(120);
  const [lastMeal, setLastMeal] = useState('Il y a 2h');

  const glucoseData = {
    labels: ['6h', '9h', '12h', '15h', '18h', '21h'],
    datasets: [
      {
        data: [80, 120, 140, 110, 130, 120],
      },
    ],
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {/* Glucose actuel */}
        <View style={styles.glucoseCard}>
          <Text style={styles.cardTitle}>Glucose actuel</Text>
          <Text style={styles.glucoseValue}>{currentGlucose} mg/dL</Text>
          <Text style={styles.lastUpdate}>Dernière mise à jour: {lastMeal}</Text>
        </View>

        {/* Graphique */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Évolution de la glycémie</Text>
          <LineChart
            data={glucoseData}
            width={350}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="food-apple" size={30} color="#4CAF50" />
            <Text style={styles.actionText}>Ajouter un repas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="needle" size={30} color="#4CAF50" />
            <Text style={styles.actionText}>Ajouter glycémie</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="pill" size={30} color="#4CAF50" />
            <Text style={styles.actionText}>Médicaments</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Mascotte animée */}
      <View style={styles.mascotContainer}>
      <ExpoImage
        source={require('../assets/images/mascot.gif')}
        style={styles.mascotGif}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  glucoseCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  glucoseValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 8,
  },
  lastUpdate: {
    color: '#666',
    fontSize: 14,
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    marginBottom: 100, // Ajouté pour éviter que le contenu ne soit caché derrière la mascotte
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    width: '28%',
  },
  actionText: {
    marginTop: 8,
    color: '#333',
    textAlign: 'center',
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 100,
    height: 100,
    zIndex: 1,
  },
  mascotGif: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
});

export default HomeScreen;