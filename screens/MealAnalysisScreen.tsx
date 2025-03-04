import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config';

const MealAnalysisScreen = ({ navigation, route }) => {
  const [mealData, setMealData] = useState({
    name: '',
    description: '',
    carbs: '',
    proteins: '',
    fats: '',
    calories: '',
    glycemicIndex: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [analysisMethod, setAnalysisMethod] = useState(null); // 'manual' ou 'image'

  // Demander les permissions au chargement du composant
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          console.log('Permission de caméra non accordée');
        }

        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaLibraryStatus !== 'granted') {
          console.log('Permission de galerie non accordée');
        }
      }
    })();
  }, []);

  // Gérer les changements d'input
  const handleChange = (name, value) => {
    setMealData({
      ...mealData,
      [name]: value
    });

    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  // Fonction pour prendre une photo
  const takePhoto = async () => {
    try {
      // Vérifier les permissions de caméra
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError("Vous devez autoriser l'accès à la caméra pour prendre une photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setAnalysisMethod('image');
      }
    } catch (err) {
      console.error('Erreur lors de la prise de photo:', err);
      setError('Impossible d\'accéder à la caméra');
    }
  };

  // Fonction pour sélectionner une image de la galerie
  const selectImage = async () => {
    try {
      // Vérifier les permissions de galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError("Vous devez autoriser l'accès à la galerie pour sélectionner une image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setAnalysisMethod('image');
      }
    } catch (err) {
      console.error('Erreur lors de la sélection d\'image:', err);
      setError('Impossible d\'accéder à la galerie');
    }
  };

  // Fonction pour analyser l'image
  const analyzeImage = async () => {
    if (!imageUri) {
      setError('Veuillez d\'abord sélectionner ou prendre une photo');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Créer un FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'meal.jpg',
      });

      // Ajouter d'autres données si nécessaire
      if (mealData.description) {
        formData.append('description', mealData.description);
      }

      // Obtenir le token d'authentification
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour analyser un repas');
        setLoading(false);
        return;
      }

      // Envoyer l'image au serveur pour analyse
      const response = await axios.post(`${API_URL}/api/repas/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Traiter la réponse
      const { imageUrl, analysis } = response.data;

      // Mettre à jour les données du repas avec les résultats de l'analyse
      setMealData({
        name: mealData.name || 'Mon repas',
        description: analysis.description || mealData.description,
        carbs: analysis.glucides_totaux?.toString() || '',
        proteins: analysis.proteines?.toString() || '',
        fats: analysis.lipides?.toString() || '',
        calories: analysis.calories?.toString() || '',
        glycemicIndex: analysis.index_glycemique?.toString() || '',
      });

      // Définir le résultat de l'analyse
      setAnalysisResult({
        impact: analysis.impact_glycemique > 50 ? 'élevé' : analysis.impact_glycemique > 30 ? 'modéré' : 'faible',
        expectedGlucoseRise: `${analysis.impact_glycemique} mg/dL`,
        recommendations: analysis.recommandations || [],
        nutritionalInfo: {
          carbs: analysis.glucides_totaux || 0,
          proteins: analysis.proteines || 0,
          fats: analysis.lipides || 0,
          calories: analysis.calories || 0,
          glycemicIndex: analysis.index_glycemique || 0,
          aliments: analysis.aliments || []
        },
        imageUrl
      });

      setSuccess('Analyse du repas terminée avec succès');
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de l\'analyse de l\'image:', err);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Le reste du code reste inchangé
  const analyzeManually = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation des champs
      if (!mealData.name.trim()) {
        setError('Veuillez donner un nom à votre repas');
        setLoading(false);
        return;
      }

      // Obtenir le token d'authentification
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour analyser un repas');
        setLoading(false);
        return;
      }

      // Obtenir les données utilisateur pour la prédiction
      const userResponse = await axios.get(`${API_URL}/api/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const userData = userResponse.data;

      // Préparer les données pour l'analyse
      const analysisData = {
        description: mealData.description,
        glucides_totaux: parseFloat(mealData.carbs) || 0,
        proteines: parseFloat(mealData.proteins) || 0,
        lipides: parseFloat(mealData.fats) || 0,
        calories: parseFloat(mealData.calories) || 0,
        index_glycemique: parseFloat(mealData.glycemicIndex) || 0
      };

      // Simuler une prédiction d'impact glycémique
      // Dans une application réelle, cela serait fait par le backend
      const impactEstime = Math.round((analysisData.glucides_totaux * analysisData.index_glycemique) / 100);

      // Générer des recommandations basées sur les données
      const recommendations = [];

      if (analysisData.index_glycemique > 70) {
        recommendations.push('Ce repas a un index glycémique élevé. Envisagez d\'ajouter plus de fibres ou de protéines.');
      }

      recommendations.push('Ordre optimal de consommation: légumes fibreux d\'abord, puis protéines, puis glucides.');

      if (userData.type_diabete === 'type1') {
        recommendations.push('Pour le diabète de type 1, ajustez votre dose d\'insuline en fonction des glucides totaux.');
      } else if (userData.type_diabete === 'type2') {
        recommendations.push('Pour le diabète de type 2, envisagez une courte marche après ce repas.');
      }

      recommendations.push('Mesurez votre glycémie 2 heures après ce repas pour comprendre son impact réel.');

      // Définir le résultat de l'analyse
      setAnalysisResult({
        impact: impactEstime > 50 ? 'élevé' : impactEstime > 30 ? 'modéré' : 'faible',
        expectedGlucoseRise: `${impactEstime} mg/dL`,
        recommendations,
        nutritionalInfo: {
          carbs: parseFloat(mealData.carbs) || 0,
          proteins: parseFloat(mealData.proteins) || 0,
          fats: parseFloat(mealData.fats) || 0,
          calories: parseFloat(mealData.calories) || 0,
          glycemicIndex: parseFloat(mealData.glycemicIndex) || 0
        }
      });

      setAnalysisMethod('manual');
      setSuccess('Analyse du repas terminée avec succès');
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de l\'analyse manuelle:', err);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder le repas
  const saveMeal = async () => {
    try {
      setLoading(true);

      // Obtenir le token d'authentification
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour sauvegarder un repas');
        setLoading(false);
        return;
      }

      // Préparer les données du repas
      const repasData = {
        photo: analysisResult.imageUrl || null,
        description: mealData.description || mealData.name,
        index_glycemique: parseFloat(mealData.glycemicIndex) || 0,
        glucides_totaux: parseFloat(mealData.carbs) || 0,
        proteines: parseFloat(mealData.proteins) || 0,
        lipides: parseFloat(mealData.fats) || 0,
        calories: parseFloat(mealData.calories) || 0,
        aliments: analysisResult.nutritionalInfo.aliments || [],
        impact_glycemique: {
          avant_repas: 0, // À remplir si disponible
          apres_repas: 0  // À remplir si disponible
        },
        recommandations: analysisResult.recommendations,
        commentaire: ''
      };

      // Envoyer les données au serveur
      await axios.post(`${API_URL}/api/repas`, repasData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Repas sauvegardé avec succès');
      setLoading(false);

      // Rediriger vers l'écran d'accueil après 2 secondes
      setTimeout(() => {
        navigation.navigate('MealAnalysisScreen');
      }, 2000);

    } catch (err) {
      console.error('Erreur lors de la sauvegarde du repas:', err);
      setError('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser l'analyse
  const resetAnalysis = () => {
    setAnalysisResult(null);
    setImageUri(null);
    setAnalysisMethod(null);
    setSuccess('');
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Analyse de Repas</Text>
          <View style={styles.divider} />
        </View>

        {error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

{success ? (
          <View style={styles.messageContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        {!analysisMethod && !analysisResult ? (
          <View style={styles.methodSelection}>
            <Text style={styles.sectionTitle}>Choisissez une méthode d'analyse</Text>

            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => setAnalysisMethod('manual')}
            >
              <Icon name="pencil" size={32} color="#4CAF50" />
              <Text style={styles.methodButtonText}>Saisie manuelle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodButton}
              onPress={takePhoto}
            >
              <Icon name="camera" size={32} color="#4CAF50" />
              <Text style={styles.methodButtonText}>Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodButton}
              onPress={selectImage}
            >
              <Icon name="image" size={32} color="#4CAF50" />
              <Text style={styles.methodButtonText}>Choisir une image</Text>
            </TouchableOpacity>
          </View>
        ) : null}

{imageUri && !analysisResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image du repas</Text>
            <Image source={{ uri: imageUri }} style={styles.mealImage} />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du repas</Text>
              <TextInput
                style={styles.input}
                value={mealData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Ex: Petit-déjeuner, Déjeuner, etc."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={mealData.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Décrivez votre repas (aliments, quantités...)"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resetAnalysis}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={analyzeImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Analyser cette image</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {analysisMethod === 'manual' && !analysisResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations sur le repas</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du repas</Text>
              <TextInput
                style={styles.input}
                value={mealData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Ex: Petit-déjeuner, Déjeuner, etc."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={mealData.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Décrivez votre repas (aliments, quantités...)"
                multiline
                numberOfLines={4}
              />
            </View>

            <Text style={styles.sectionSubtitle}>Valeurs nutritionnelles</Text>

            <View style={styles.rowContainer}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Glucides (g)</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.carbs}
                  onChangeText={(text) => handleChange('carbs', text)}
                  placeholder="Ex: 45"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Protéines (g)</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.proteins}
                  onChangeText={(text) => handleChange('proteins', text)}
                  placeholder="Ex: 15"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Lipides (g)</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.fats}
                  onChangeText={(text) => handleChange('fats', text)}
                  placeholder="Ex: 10"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={mealData.calories}
                  onChangeText={(text) => handleChange('calories', text)}
                  placeholder="Ex: 330"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Index glycémique estimé</Text>
              <TextInput
                style={styles.input}
                value={mealData.glycemicIndex}
                onChangeText={(text) => handleChange('glycemicIndex', text)}
                placeholder="Ex: 55 (faible: <55, moyen: 55-70, élevé: >70)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={resetAnalysis}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={analyzeManually}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Analyser ce repas</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {analysisResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de l'analyse</Text>

            {analysisResult.imageUrl && (
              <Image source={{ uri: analysisResult.imageUrl }} style={styles.mealImage} />
            )}

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Impact sur la glycémie:</Text>
              <Text style={[
                styles.resultValue,
                analysisResult.impact === 'élevé' ? styles.highImpact :
                analysisResult.impact === 'modéré' ? styles.mediumImpact :
                styles.lowImpact
              ]}>
                {analysisResult.impact}
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Hausse glycémique estimée:</Text>
              <Text style={styles.resultValue}>{analysisResult.expectedGlucoseRise}</Text>
            </View>

            {analysisResult.nutritionalInfo.aliments && analysisResult.nutritionalInfo.aliments.length > 0 && (
              <View style={styles.foodItemsContainer}>
                <Text style={styles.foodItemsTitle}>Aliments détectés:</Text>
                <View style={styles.foodItemsList}>
                  {analysisResult.nutritionalInfo.aliments.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <Icon name="food" size={16} color="#4CAF50" style={styles.foodItemIcon} />
                      <Text style={styles.foodItemText}>{food}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Icon name="food-apple" size={24} color="#4CAF50" />
                <Text style={styles.nutritionValue}>{analysisResult.nutritionalInfo.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Glucides</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Icon name="food-steak" size={24} color="#FF9800" />
                <Text style={styles.nutritionValue}>{analysisResult.nutritionalInfo.proteins}g</Text>
                <Text style={styles.nutritionLabel}>Protéines</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Icon name="oil" size={24} color="#2196F3" />
                <Text style={styles.nutritionValue}>{analysisResult.nutritionalInfo.fats}g</Text>
                <Text style={styles.nutritionLabel}>Lipides</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Icon name="fire" size={24} color="#F44336" />
                <Text style={styles.nutritionValue}>{analysisResult.nutritionalInfo.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
            </View>

            <Text style={styles.recommendationsTitle}>Recommandations:</Text>
            {analysisResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="check-circle" size={18} color="#4CAF50" style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveMeal}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sauvegarder ce repas</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={resetAnalysis}
            >
              <Text style={styles.secondaryButtonText}>Nouvelle analyse</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
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
  methodSelection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  methodButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodButtonText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
    marginBottom: 12,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
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
  successText: {
    color: '#388E3C',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  highImpact: {
    color: '#D32F2F',
  },
  mediumImpact: {
    color: '#FF9800',
  },
  lowImpact: {
    color: '#4CAF50',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 10,
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
  recommendationsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 5,
  },
  recommendationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  foodItemsContainer: {
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
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
  }
});
export default MealAnalysisScreen;