import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomeScreen = () => {
  // États de base
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // États pour les données de santé
  const [glycemieStats, setGlycemieStats] = useState({
    average: 0,
    inRange: 0,
    min: 0,
    max: 0,
    lastValue: 0
  });
  const [chartData, setChartData] = useState({
    labels: [],
    values: []
  });

  const fetchUserData = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token non trouvé');

      const response = await fetch('http://192.168.1.16:5000/api/user/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur serveur');

      const data = await response.json();
      console.log("Données reçues:", data); // Debug log
      setUserData(data);

      // Traitement des données de glycémie
      if (data.glycemie && data.glycemie.length > 0) {
        // Trier les glycémies par date
        const sortedGlycemie = data.glycemie.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculer les statistiques sur toutes les données
        const values = sortedGlycemie.map(g => g.valeur);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const inRange = sortedGlycemie.filter(g => g.valeur >= 70 && g.valeur <= 180).length;
        
        setGlycemieStats({
          average: Math.round(avg * 10) / 10,
          inRange: Math.round((inRange / sortedGlycemie.length) * 100),
          min: Math.min(...values),
          max: Math.max(...values),
          lastValue: sortedGlycemie[0].valeur // Dernière valeur (la plus récente)
        });

        // Données pour le graphique
        setChartData({
          labels: sortedGlycemie.map(g => {
            const date = new Date(g.date);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          }),
          values: sortedGlycemie.map(g => g.valeur)
        });

        console.log("Stats calculées:", {
          values,
          average: Math.round(avg * 10) / 10,
          inRange: Math.round((inRange / sortedGlycemie.length) * 100),
          min: Math.min(...values),
          max: Math.max(...values),
          lastValue: sortedGlycemie[0].valeur
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("❌ Erreur:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>Une erreur est survenue</Text>
        <Text style={styles.errorSubText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec dernière glycémie */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Bonjour {userData?.user?.nom || 'utilisateur'}
          </Text>
          <View style={styles.lastGlycemie}>
            <Text style={styles.lastGlycemieValue}>
              {glycemieStats.lastValue} mg/dL
            </Text>
            <Text style={styles.lastGlycemieLabel}>Dernière glycémie</Text>
          </View>
        </View>
      </View>

      {/* KPIs */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="chart-line" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{glycemieStats.average}</Text>
          <Text style={styles.statLabel}>Moyenne</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="target" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{glycemieStats.inRange}%</Text>
          <Text style={styles.statLabel}>Dans la cible</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="arrow-up-bold" size={24} color="#ff6b6b" />
          <Text style={styles.statValue}>{glycemieStats.max}</Text>
          <Text style={styles.statLabel}>Maximum</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="arrow-down-bold" size={24} color="#4dabf7" />
          <Text style={styles.statValue}>{glycemieStats.min}</Text>
          <Text style={styles.statLabel}>Minimum</Text>
        </View>
      </View>

      {/* Graphique */}
      {chartData.values.length > 0 ? (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Évolution de la glycémie</Text>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{
                data: chartData.values,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`
              }]
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#4CAF50"
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={styles.noDataCard}>
          <Icon name="chart-line-variant" size={50} color="#666666" />
          <Text style={styles.noDataText}>Aucune donnée aujourd'hui</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    marginBottom: 20,
    elevation: 5, // Ajoute une ombre sur Android
    shadowColor: '#000', // Ajoute une ombre sur iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  lastGlycemie: {
    alignItems: 'flex-end'
  },
  lastGlycemieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  lastGlycemieLabel: {
    fontSize: 14,
    color: '#ffffff'
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    elevation: 2
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4
  },
  chartCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16
  },
  chart: {
    borderRadius: 12
  },
  noDataCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 32,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center'
  },
  noDataText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    marginTop: 16
  },
  errorSubText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8
  }
});

export default HomeScreen;