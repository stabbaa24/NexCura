import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const HomeScreen = () => {
  const [userData, setUserData] = useState(null);
  const [lastMeal, setLastMeal] = useState(null);
  const [glucoseHistory, setGlucoseHistory] = useState([]);
  const [glucoseLabels, setGlucoseLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.16:5000/api/user/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log("📌 Données utilisateur :", data);

        if (response.ok) {
          setUserData(data);

          // Trier et formater les glycémies
          if (data.glycemie && data.glycemie.length > 0) {
            const sortedGlycemie = data.glycemie.sort((a, b) => new Date(a.date) - new Date(b.date));
            setGlucoseHistory(sortedGlycemie.map(g => g.valeur));
            setGlucoseLabels(sortedGlycemie.map(g => {
              const date = new Date(g.date);
              return `${date.getHours()}h${date.getMinutes()}`;
            }));
          }

          // Trier et afficher le dernier repas
          if (data.repas && data.repas.length > 0) {
            const sortedRepas = data.repas.sort((a, b) => new Date(b.date) - new Date(a.date));
            setLastMeal(sortedRepas[0]);
          }
        }
      } catch (error) {
        console.error("❌ Erreur:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>
          Bonjour {userData?.user?.nom || 'utilisateur'}
        </Text>
      </View>

      {/* Dernier repas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dernier repas</Text>
        {lastMeal ? (
          <>
            <Text style={styles.mealDescription}>{lastMeal.description}</Text>
            <Text style={styles.mealInfo}>
              {new Date(lastMeal.date).toLocaleTimeString()}
            </Text>
          </>
        ) : (
          <Text>Aucun repas enregistré</Text>
        )}
      </View>

      {/* Graphique glycémie */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Glycémie</Text>
        {glucoseHistory.length > 0 ? (
          <LineChart
            data={{
              labels: glucoseLabels,
              datasets: [{ data: glucoseHistory }]
            }}
            width={350}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`
            }}
            style={styles.chart}
          />
        ) : (
          <Text>Aucune donnée de glycémie</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: '#4CAF50' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  card: { backgroundColor: '#ffffff', margin: 16, padding: 16, borderRadius: 12, elevation: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333333', marginBottom: 8 },
  mealDescription: { fontSize: 16, color: '#333333' },
  mealInfo: { fontSize: 14, color: '#666666', marginTop: 4 },
  chart: { marginVertical: 8, borderRadius: 16 }
});

export default HomeScreen;
