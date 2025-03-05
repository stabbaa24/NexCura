import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_URL } from '../config';

const HistoricMealAnalysisScreen = ({ navigation }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [error, setError] = useState('');

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour obtenir l'URL complète de l'image
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Si l'URL est déjà complète, la retourner telle quelle
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Sinon, ajouter le préfixe Cloudinary
    return `https://res.cloudinary.com/dszucpj0a/image/upload/${imageUrl}`;
  };

  // Fonction pour charger les repas
  const loadMeals = async () => {
    try {
      setError('');
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setError('Vous devez être connecté pour voir votre historique');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/repas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setMeals(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des repas:', err);
      setError('Impossible de charger l\'historique des repas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les repas au montage du composant et à chaque fois que l'écran est focalisé
  useEffect(() => {
    loadMeals();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  // Fonction pour rafraîchir la liste
  const onRefresh = () => {
    setRefreshing(true);
    loadMeals();
  };

  // Fonction pour basculer l'expansion d'un repas
  const toggleExpand = (id) => {
    setExpandedMealId(expandedMealId === id ? null : id);
  };

  // Fonction pour supprimer un repas
  const deleteMeal = async (id) => {
    Alert.alert(
      "Supprimer ce repas",
      "Êtes-vous sûr de vouloir supprimer ce repas de votre historique ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('token');
              
              await axios.delete(`${API_URL}/api/repas/${id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              // Mettre à jour la liste après suppression
              setMeals(meals.filter(meal => meal._id !== id));
              Alert.alert("Succès", "Le repas a été supprimé avec succès");
            } catch (err) {
              console.error('Erreur lors de la suppression du repas:', err);
              Alert.alert("Erreur", "Impossible de supprimer ce repas");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Rendu d'un élément de la liste
  const renderMealItem = ({ item }) => {
    const isExpanded = expandedMealId === item._id;
    
    return (
      <View style={styles.mealCard}>
        <TouchableOpacity 
          style={styles.mealHeader} 
          onPress={() => toggleExpand(item._id)}
        >
          <View style={styles.mealHeaderContent}>
            <Text style={styles.mealTitle}>
              {item.description || "Repas sans description"}
            </Text>
            <Text style={styles.mealDate}>{formatDate(item.date)}</Text>
          </View>
          <Icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.mealDetails}>
            {item.photo && (
              <Image 
                source={{ uri: getFullImageUrl(item.photo) }} 
                style={styles.mealImage} 
              />
            )}
            
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Icon name="food-apple" size={24} color="#4CAF50" />
                <Text style={styles.nutritionValue}>{item.glucides_totaux}g</Text>
                <Text style={styles.nutritionLabel}>Glucides</Text>
              </View>
              
              <View style={styles.nutritionItem}>
                <Icon name="food-steak" size={24} color="#FF9800" />
                <Text style={styles.nutritionValue}>{item.proteines}g</Text>
                <Text style={styles.nutritionLabel}>Protéines</Text>
              </View>
              
              <View style={styles.nutritionItem}>
                <Icon name="oil" size={24} color="#2196F3" />
                <Text style={styles.nutritionValue}>{item.lipides}g</Text>
                <Text style={styles.nutritionLabel}>Lipides</Text>
              </View>
              
              <View style={styles.nutritionItem}>
                <Icon name="fire" size={24} color="#F44336" />
                <Text style={styles.nutritionValue}>{item.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
            </View>
            
            <View style={styles.glycemicSection}>
              <View style={styles.glycemicItem}>
                <Text style={styles.glycemicLabel}>Index glycémique:</Text>
                <Text style={[
                  styles.glycemicValue,
                  item.index_glycemique > 70 ? styles.highGlycemic :
                  item.index_glycemique > 55 ? styles.mediumGlycemic :
                  styles.lowGlycemic
                ]}>
                  {item.index_glycemique}
                  <Text style={styles.glycemicNote}>
                    {item.index_glycemique > 70 ? " (élevé)" :
                     item.index_glycemique > 55 ? " (moyen)" :
                     " (faible)"}
                  </Text>
                </Text>
              </View>
              
              <View style={styles.glycemicItem}>
                <Text style={styles.glycemicLabel}>Impact estimé:</Text>
                <Text style={styles.glycemicValue}>
                  {item.impact_glycemique ? 
                    `${item.impact_glycemique} mg/dL` : 
                    "Non disponible"}
                </Text>
              </View>
            </View>
            
            {item.aliments && item.aliments.length > 0 && (
              <View style={styles.foodItemsContainer}>
                <Text style={styles.foodItemsTitle}>Aliments:</Text>
                <View style={styles.foodItemsList}>
                  {item.aliments.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <Icon name="food" size={16} color="#4CAF50" style={styles.foodItemIcon} />
                      <Text style={styles.foodItemText}>{food}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {item.commentaire && (
              <View style={styles.commentSection}>
                <Text style={styles.commentTitle}>Commentaire:</Text>
                <Text style={styles.commentText}>{item.commentaire}</Text>
              </View>
            )}
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteMeal(item._id)}
              >
                <Icon name="delete" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Rendu principal
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des Repas</Text>
        <View style={styles.divider} />
      </View>
      
      {error ? (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Chargement de votre historique...</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMealItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="food-off" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucun repas dans votre historique</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('MealAnalysis')}
              >
                <Text style={styles.addButtonText}>Ajouter un repas</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 15,
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
  messageContainer: {
    padding: 12,
    margin: 20,
    borderRadius: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealHeaderContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mealDate: {
    fontSize: 14,
    color: '#666',
  },
  mealDetails: {
    padding: 16,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
    width: '25%',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
  },
  glycemicSection: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  glycemicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  glycemicLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  glycemicValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  glycemicNote: {
    fontWeight: 'normal',
    fontSize: 14,
  },
  highGlycemic: {
    color: '#D32F2F',
  },
  mediumGlycemic: {
    color: '#FF9800',
  },
  lowGlycemic: {
    color: '#4CAF50',
  },
  foodItemsContainer: {
    marginVertical: 16,
  },
  foodItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  foodItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
  },
  foodItemIcon: {
    marginRight: 5,
  },
  foodItemText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  commentSection: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    color: '#444',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HistoricMealAnalysisScreen;