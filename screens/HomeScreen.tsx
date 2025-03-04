
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; 

const HomeScreen = () => {
  const navigation = useNavigation();
  const [glycemieStats, setGlycemieStats] = useState({
    lastValue: 0,
    lastUpdate: 'Chargement...',
    chartData: {
      labels: ['6h', '9h', '12h', '15h', '18h', '21h'],
      values: [0, 0, 0, 0, 0, 0],
    },
    dataDate: null,
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('Token non trouvé, veuillez vous reconnecter');
      }

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
      console.log('Glycémie data count:', data.glycemie ? data.glycemie.length : 0);

      setUserData(data);

      // Update glycemie data if available
      if (data.glycemie && data.glycemie.length > 0) {
        console.log('Traitement des données de glycémie...');
        // Regrouper les données par jour
        const groupedByDay = groupGlycemieByDay(data.glycemie);
        console.log('Jours disponibles:', Object.keys(groupedByDay));

        // Obtenir la date actuelle au format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Vérifier si nous avons des données pour aujourd'hui
        let dataToDisplay = groupedByDay[today] || [];
        let displayDate = today;

        // Si pas de données pour aujourd'hui, prendre la dernière date disponible
        if (dataToDisplay.length === 0) {
          // Trier les dates en ordre décroissant
          const availableDates = Object.keys(groupedByDay).sort().reverse();
          console.log('Pas de données pour aujourd\'hui, dates disponibles:', availableDates);

          if (availableDates.length > 0) {
            displayDate = availableDates[0];
            dataToDisplay = groupedByDay[displayDate];
            console.log(`Utilisation des données du ${displayDate}, ${dataToDisplay.length} mesures trouvées`);
          }
        }

        // Formater les données pour l'affichage
        const formattedData = formatGlycemieData(dataToDisplay);

        // Obtenir la dernière valeur (la plus récente)
        const latestGlycemie = data.glycemie[0];

        // Formater la date pour l'affichage
        const displayDateObj = new Date(displayDate);
        const isToday = displayDate === today;
        const dateDisplay = isToday
          ? "Aujourd'hui"
          : displayDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        setGlycemieStats({
          lastValue: latestGlycemie.valeur,
          lastUpdate: new Date(latestGlycemie.date).toLocaleString(),
          chartData: formattedData,
          dataDate: dateDisplay,
        });
      } else {
        console.log('Aucune donnée de glycémie disponible');
        // Réinitialiser les stats si aucune donnée n'est disponible
        setGlycemieStats({
          lastValue: 0,
          lastUpdate: 'Aucune donnée disponible',
          chartData: {
            labels: ['6h', '9h', '12h', '15h', '18h', '21h'],
            values: [0, 0, 0, 0, 0, 0],
          },
          dataDate: "Aucune donnée disponible",
        });
      }

      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      setError(error.message);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Erreur', 'Impossible de récupérer vos données: ' + error.message);
    }
  };

  // Rafraîchir les données lorsque l'écran est affiché
  useFocusEffect(
    useCallback(() => {
      fetchUserData();

      // Configurer un rafraîchissement automatique toutes les 60 secondes
      const intervalId = setInterval(() => {
        console.log('Rafraîchissement automatique des données...');
        fetchUserData();
      }, 60000); // 60000 ms = 1 minute

      // Nettoyer l'intervalle lorsque l'écran n'est plus affiché
      return () => clearInterval(intervalId);
    }, [])
  );

  // Fonction pour gérer le rafraîchissement manuel (pull-to-refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData();
  }, []);

  // Fonction pour regrouper les données de glycémie par jour
  const groupGlycemieByDay = (glycemieData) => {
    const grouped = {};

    glycemieData.forEach(item => {
      // Extraire la date sans l'heure (YYYY-MM-DD)
      const dateOnly = new Date(item.date).toISOString().split('T')[0];

      if (!grouped[dateOnly]) {
        grouped[dateOnly] = [];
      }

      grouped[dateOnly].push(item);
    });

    return grouped;
  };

  // Fonction pour formater les données de glycémie pour le graphique
  const formatGlycemieData = (glycemieItems) => {
    if (!glycemieItems || glycemieItems.length === 0) {
      return {
        labels: ['6h', '9h', '12h', '15h', '18h', '21h'],
        values: [0, 0, 0, 0, 0, 0],
      };
    }

    // Trier par heure
    const sortedItems = [...glycemieItems].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Limiter à 6 points de données maximum
    const limitedItems = sortedItems.slice(0, 6);

    return {
      labels: limitedItems.map(g => new Date(g.date).getHours() + 'h'),
      values: limitedItems.map(g => g.valeur),
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor={'#4CAF50'}
          />
        }
      >
        {/* Carte de glycémie actuelle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Glucose actuel</Text>
          {loading && !refreshing ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : glycemieStats.lastValue > 0 ? (
            <>
              <Text style={styles.cardValue}>{glycemieStats.lastValue} mg/dL</Text>
              <Text style={styles.cardSubtitle}>Dernière mise à jour: {glycemieStats.lastUpdate}</Text>
            </>
          ) : (
            <Text style={styles.noDataText}>Aucune donnée disponible</Text>
          )}
        </View>

        {/* Graphique */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Évolution de la glycémie</Text>
          {glycemieStats.dataDate ? (
            <Text style={styles.chartDateInfo}>Données du : {glycemieStats.dataDate}</Text>
          ) : (
            <Text style={styles.chartDateInfo}>Aucune donnée disponible</Text>
          )}

          {/* Afficher le graphique seulement s'il y a des données */}
          {glycemieStats.chartData.values.some(val => val > 0) ? (
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
          ) : (
            <View style={styles.noDataChartContainer}>
              <Text style={styles.noDataChartText}>Aucune donnée à afficher</Text>
            </View>
          )}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MealAnalysis')}
          >
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
    color: '#000',
    marginVertical: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#000',
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
    color: '#000',
    marginBottom: 8,
  },
  chartDateInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
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
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
    marginVertical: 10,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  noDataChartContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  noDataChartText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;