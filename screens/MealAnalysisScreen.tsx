import React, { useState } from 'react';
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
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Gérer les changements d'input
  const handleChange = (name, value) => {
    setMealData({
      ...mealData,
      [name]: value
    });
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  // Fonction pour analyser le repas
  const analyzeMeal = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validation des champs
      if (!mealData.name.trim()) {
        setError('Veuillez donner un nom à votre repas');
        setLoading(false);
        return;
      }
      
      // Simuler une analyse (à remplacer par un appel API réel)
      // Dans une application réelle, vous enverriez ces données à votre backend
      
      // Simulation d'un délai d'analyse
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Résultat simulé de l'analyse
      const result = {
        impact: 'modéré',
        expectedGlucoseRise: '30-45 mg/dL',
        recommendations: [
          'Consommer ce repas avec une source de protéines pour ralentir l\'absorption des glucides',
          'Envisager une courte marche après ce repas pour aider à stabiliser la glycémie',
          'Surveiller votre glycémie 1-2 heures après ce repas'
        ],
        nutritionalInfo: {
          carbs: mealData.carbs ? parseFloat(mealData.carbs) : 45,
          proteins: mealData.proteins ? parseFloat(mealData.proteins) : 15,
          fats: mealData.fats ? parseFloat(mealData.fats) : 10,
          calories: mealData.calories ? parseFloat(mealData.calories) : 330,
          glycemicIndex: mealData.glycemicIndex ? parseFloat(mealData.glycemicIndex) : 55
        }
      };
      
      setAnalysisResult(result);
      setSuccess('Analyse du repas terminée avec succès');
      setLoading(false);
      
    } catch (err) {
      console.error('Erreur lors de l\'analyse du repas:', err);
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder le repas
  const saveMeal = async () => {
    try {
      setLoading(true);
      
      // Ici, vous implémenteriez la logique pour sauvegarder le repas dans votre base de données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Repas sauvegardé avec succès');
      setLoading(false);
      
      // Rediriger vers l'écran d'accueil après 2 secondes
      setTimeout(() => {
        navigation.navigate('TabHome');
      }, 2000);
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du repas:', err);
      setError('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
      setLoading(false);
    }
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
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valeurs nutritionnelles (optionnel)</Text>
          
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
        </View>
        
        {!analysisResult ? (
          <TouchableOpacity 
            style={styles.button} 
            onPress={analyzeMeal}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Analyser ce repas</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de l'analyse</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Impact sur la glycémie:</Text>
              <Text style={styles.resultValue}>{analysisResult.impact}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Hausse glycémique estimée:</Text>
              <Text style={styles.resultValue}>{analysisResult.expectedGlucoseRise}</Text>
            </View>
            
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
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
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
});

export default MealAnalysisScreen;