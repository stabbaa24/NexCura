
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const EducationScreen = () => {
  const [activeCategory, setActiveCategory] = useState('diabete');

  const categories = [
    { id: 'diabete', title: 'Diabète', icon: 'diabetes' },
    { id: 'alimentation', title: 'Alimentation', icon: 'food-apple' },
    { id: 'activite', title: 'Activité physique', icon: 'run' },
    { id: 'medicaments', title: 'Médicaments', icon: 'pill' }
  ];

  const articles = {
    diabete: [
      {
        id: 1,
        title: 'Comprendre le diabète',
        summary: 'Le diabète est une maladie chronique qui survient lorsque le pancréas ne produit pas assez d\'insuline ou lorsque l\'organisme n\'utilise pas correctement l\'insuline qu\'il produit.',
        content: 'Le diabète est une maladie chronique caractérisée par un taux élevé de sucre dans le sang (hyperglycémie). Il existe principalement deux types de diabète :\n\n• Le diabète de type 1 : le corps ne produit pas d\'insuline. C\'est une maladie auto-immune où le système immunitaire attaque les cellules du pancréas qui produisent l\'insuline.\n\n• Le diabète de type 2 : le corps ne produit pas assez d\'insuline ou les cellules résistent à l\'action de l\'insuline. C\'est le type le plus courant et il est souvent lié au mode de vie.',
        image: 'https://www.example.com/diabetes.jpg'
      },
      {
        id: 2,
        title: 'Symptômes du diabète',
        summary: 'Reconnaître les signes avant-coureurs du diabète peut aider à un diagnostic précoce et à une meilleure prise en charge.',
        content: 'Les symptômes courants du diabète comprennent :\n\n• Soif excessive et bouche sèche\n• Mictions fréquentes\n• Fatigue intense\n• Faim constante\n• Perte de poids inexpliquée\n• Vision floue\n• Plaies qui guérissent lentement\n\nSi vous présentez ces symptômes, consultez un professionnel de santé pour un diagnostic.',
        image: 'https://www.example.com/symptoms.jpg'
      },
      {
        id: 3,
        title: 'Surveillance de la glycémie',
        summary: 'Apprendre à surveiller votre taux de sucre dans le sang est essentiel pour gérer efficacement le diabète.',
        content: 'La surveillance régulière de votre glycémie vous aide à comprendre comment votre corps réagit à la nourriture, à l\'activité physique et aux médicaments. Voici quelques conseils :\n\n• Utilisez un glucomètre pour mesurer votre glycémie\n• Tenez un journal de vos mesures\n• Apprenez à reconnaître les signes d\'hypoglycémie (taux de sucre trop bas) et d\'hyperglycémie (taux de sucre trop élevé)\n• Consultez régulièrement votre médecin pour ajuster votre traitement si nécessaire',
        image: 'https://www.example.com/monitoring.jpg'
      }
    ],
    alimentation: [
      {
        id: 4,
        title: 'Alimentation équilibrée',
        summary: 'Une alimentation équilibrée est essentielle pour gérer le diabète et maintenir une glycémie stable.',
        content: 'Pour les personnes diabétiques, il est important de :\n\n• Privilégier les aliments à faible indice glycémique\n• Consommer des fibres (légumes, fruits entiers, légumineuses)\n• Limiter les sucres ajoutés et les glucides raffinés\n• Répartir les repas tout au long de la journée\n• Contrôler les portions\n\nUn diététicien peut vous aider à élaborer un plan alimentaire adapté à vos besoins.',
        image: 'https://www.example.com/healthy-eating.jpg'
      },
      {
        id: 5,
        title: 'Comprendre l\'indice glycémique',
        summary: 'L\'indice glycémique (IG) mesure l\'impact des aliments sur la glycémie. Apprendre à choisir des aliments à faible IG peut aider à contrôler le diabète.',
        content: 'L\'indice glycémique classe les aliments selon leur effet sur la glycémie :\n\n• IG bas (moins de 55) : la plupart des fruits et légumes, légumineuses, produits laitiers, pain complet\n• IG moyen (56-69) : riz brun, couscous, pain de seigle\n• IG élevé (70 et plus) : pain blanc, riz blanc, pommes de terre, sucreries\n\nPrivilégiez les aliments à IG bas pour maintenir une glycémie stable.',
        image: 'https://www.example.com/glycemic-index.jpg'
      }
    ],
    activite: [
      {
        id: 6,
        title: 'Bienfaits de l\'activité physique',
        summary: 'L\'exercice régulier aide à améliorer la sensibilité à l\'insuline et à maintenir un poids santé.',
        content: 'L\'activité physique régulière présente de nombreux avantages pour les personnes diabétiques :\n\n• Améliore la sensibilité à l\'insuline\n• Aide à maintenir un poids santé\n• Réduit le risque de maladies cardiovasculaires\n• Améliore la circulation sanguine\n• Réduit le stress\n\nVisez au moins 150 minutes d\'activité modérée par semaine, réparties sur plusieurs jours.',
        image: 'https://www.example.com/exercise.jpg'
      },
      {
        id: 7,
        title: 'Activités recommandées',
        summary: 'Découvrez les meilleures activités physiques pour les personnes atteintes de diabète.',
        content: 'Voici quelques activités particulièrement bénéfiques pour les personnes diabétiques :\n\n• La marche rapide\n• La natation\n• Le vélo\n• La danse\n• Le yoga\n• L\'aquagym\n\nCommencez doucement et augmentez progressivement l\'intensité. Consultez votre médecin avant de commencer un nouveau programme d\'exercice.',
        image: 'https://www.example.com/activities.jpg'
      }
    ],
    medicaments: [
      {
        id: 8,
        title: 'Comprendre votre traitement',
        summary: 'Connaître vos médicaments et leur fonctionnement est essentiel pour gérer efficacement le diabète.',
        content: 'Différents types de médicaments peuvent être prescrits pour le diabète :\n\n• Insuline : remplace l\'insuline que votre corps ne produit pas ou pas suffisamment\n• Metformine : réduit la production de glucose par le foie\n• Sulfonylurées : stimulent la production d\'insuline\n• Inhibiteurs de la DPP-4 : augmentent les hormones qui stimulent la production d\'insuline\n• Inhibiteurs du SGLT2 : aident les reins à éliminer le glucose\n\nIl est crucial de prendre vos médicaments comme prescrit et de signaler tout effet secondaire à votre médecin.',
        image: 'https://www.example.com/medications.jpg'
      },
      {
        id: 9,
        title: 'Gestion des médicaments',
        summary: 'Des conseils pratiques pour gérer efficacement vos médicaments contre le diabète.',
        content: 'Pour tirer le meilleur parti de votre traitement :\n\n• Prenez vos médicaments à heures régulières\n• Utilisez un pilulier pour organiser vos doses\n• N\'arrêtez jamais un médicament sans consulter votre médecin\n• Informez tous vos médecins des médicaments que vous prenez\n• Vérifiez les interactions médicamenteuses avec votre pharmacien\n• Conservez vos médicaments correctement\n\nUne bonne gestion des médicaments est essentielle pour contrôler votre diabète.',
        image: 'https://www.example.com/medication-management.jpg'
      }
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Éducation Santé</Text>
      
      {/* Catégories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Icon 
              name={category.icon} 
              size={24} 
              color={activeCategory === category.id ? '#fff' : '#2196F3'} 
            />
            <Text 
              style={[
                styles.categoryText,
                activeCategory === category.id && styles.activeCategoryText
              ]}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Articles */}
      <ScrollView style={styles.articlesContainer}>
        {articles[activeCategory].map(article => (
          <TouchableOpacity 
            key={article.id}
            style={styles.articleCard}
          >
            <View style={styles.articleHeader}>
              <Icon name="book-open-page-variant" size={24} color="#4CAF50" />
              <Text style={styles.articleTitle}>{article.title}</Text>
            </View>
            <Text style={styles.articleSummary}>{article.summary}</Text>
            <View style={styles.readMoreContainer}>
              <Text style={styles.readMore}>Lire plus</Text>
              <Icon name="chevron-right" size={20} color="#2196F3" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Conseil du jour */}
      <View style={styles.tipContainer}>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb-on" size={24} color="#FFD700" />
          <Text style={styles.tipTitle}>Conseil du jour</Text>
        </View>
        <Text style={styles.tipContent}>
          Buvez beaucoup d'eau tout au long de la journée. L'hydratation aide à maintenir une glycémie stable et favorise l'élimination des toxines.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    elevation: 2,
  },
  activeCategoryButton: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  activeCategoryText: {
    color: '#fff',
  },
  articlesContainer: {
    flex: 1,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  articleSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  readMore: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tipContainer: {
    backgroundColor: '#E1F5FE',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  tipContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default EducationScreen;