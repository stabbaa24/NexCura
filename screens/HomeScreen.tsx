import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  const [glycemieStats, setGlycemieStats] = useState({
    lastValue: 120, 
    lastUpdate: 'Il y a 2h',
    chartData: {
      labels: ['6h', '9h', '12h', '15h', '18h', '21h'],
      values: [80, 95, 110, 125, 140, 120],
    },
  });
  
  // Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        
        // Use localhost for emulator or your actual IP address
        // For Android emulator, use 10.0.2.2 instead of localhost
        // For iOS simulator, use localhost
        // For physical device, use your computer's actual IP on the network
        const apiUrl = 'http://192.168.91.150:5000/api/user/me'; // Android emulator
        // const apiUrl = 'http://localhost:5000/api/user/me'; // iOS simulator
        // const apiUrl = 'http://YOUR_ACTUAL_IP:5000/api/user/me'; // Physical device
        
        console.log('Fetching from:', apiUrl);
        
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
        
        // Update glycemie data if available
        if (data.glycemie && data.glycemie.length > 0) {
          const latestGlycemie = data.glycemie[0];
          setGlycemieStats({
            lastValue: latestGlycemie.valeur,
            lastUpdate: new Date(latestGlycemie.date).toLocaleString(),
            chartData: {
              // Format the data for the chart
              labels: data.glycemie.slice(0, 6).map(g => 
                new Date(g.date).getHours() + 'h'
              ).reverse(),
              values: data.glycemie.slice(0, 6).map(g => g.valeur).reverse(),
            },
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        setError(error.message);
        setLoading(false);
        Alert.alert('Erreur', 'Impossible de récupérer vos données: ' + error.message);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Carte de glycémie actuelle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Glucose actuel</Text>
          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : (
            <>
              <Text style={styles.cardValue}>{glycemieStats.lastValue} mg/dL</Text>
              <Text style={styles.cardSubtitle}>Dernière mise à jour: {glycemieStats.lastUpdate}</Text>
            </>
          )}
        </View>

        {/* Graphique */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Évolution de la glycémie</Text>
          <LineChart
            data={{
              labels: glycemieStats.chartData.labels,
              datasets: [
                {
                  data: glycemieStats.chartData.values,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffff',
              backgroundGradientFrom: '#ffff',
              backgroundGradientTo: '#ffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="apple" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Ajouter un repas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="needle" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Ajouter glycémie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="pill" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Traitement</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#357AB7',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#000000',
  },
  chartCard: {
    backgroundColor: '#ffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#ffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
    elevation: 2,
  },
  actionText: {
    fontSize: 11,
    color: '#000000',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#000000',
    marginVertical: 10,
  },
});

export default HomeScreen;