import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ScrollViewProps, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Linking } from 'react-native';
import PieChart from 'react-native-pie-chart';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;

const EducationScreen = () => {
  const scrollRef = useRef(null);
  const diabeteRef = useRef<ScrollView>(null);
  const nutritionRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState('diabete');
  
  useEffect(() => {
    const ref = activeTab === 'diabete' ? diabeteRef.current : nutritionRef.current;
    ref?.scrollTo({ y: 0, animated: true });
  }, [activeTab]);

  

const renderPlate = () => {
  const widthAndHeight = 180;
  const series = [
    { value: 50, color: '#43A047' },   // Légumes
    { value: 25, color: '#FB8C00' },   // Féculents
    { value: 25, color: '#8E24AA' },   // Protéines
  ];

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <PieChart
        widthAndHeight={widthAndHeight}
        series={series}
      />
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <Icon name="food-apple" size={18} color="#43A047" style={{ marginRight: 6 }} />
          <Text style={styles.legendLabel}>Légumes (50%)</Text>
        </View>
        <View style={styles.legendItem}>
          <Icon name="bread-slice" size={18} color="#FB8C00" style={{ marginRight: 6 }} />
          <Text style={styles.legendLabel}>Féculents (25%)</Text>
        </View>
        <View style={styles.legendItem}>
          <Icon name="food-drumstick" size={18} color="#8E24AA" style={{ marginRight: 6 }} />
          <Text style={styles.legendLabel}>Protéines (25%)</Text>
        </View>
      </View>
    </View>
  );
};


  const renderDiabeteContent = () => (
    <ScrollView ref={diabeteRef} style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 10 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Qu'est-ce que le diabète ?</Text>
        <Text style={styles.cardText}>
          Le diabète est une maladie chronique qui se caractérise par un niveau élevé de sucre dans le sang.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quels sont les différents types de diabète ?</Text>
        
        <View style={styles.typeContainer}>
          <View style={styles.typeCard}>
            <Text style={styles.typeTitle}>Diabète de type 1</Text>
            <Text style={styles.typeText}>
              Maladie auto immune, traitée par insuline diagnostiquée dans l'enfance ou jeune adulte.
            </Text>
          </View>
          
          <View style={styles.typeCard}>
            <Text style={styles.typeTitle}>Diabète De type 2</Text>
            <Text style={styles.typeText}>
              Plus fréquent, souvent lié au mode de vie et à des facteurs génétiques.
              Peut être contrôler par une alimentation saine, de l'exercice, des médicaments oraux et parfois de
              l'insuline.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quels sont les signes et symptômes possible du diabète ?</Text>
        <View style={styles.symptomsList}>
          <View style={styles.symptomItem}>
            <Icon name="water" size={24} color="#4CAF50" />
            <Text style={styles.symptomText}>Soif excessive</Text>
          </View>
          <View style={styles.symptomItem}>
            <Icon name="toilet" size={24} color="#4CAF50" />
            <Text style={styles.symptomText}>Uriner fréquemment</Text>
          </View>
          <View style={styles.symptomItem}>
            <Icon name="sleep" size={24} color="#4CAF50" />
            <Text style={styles.symptomText}>Fatigue</Text>
          </View>
          <View style={styles.symptomItem}>
            <Icon name="scale" size={24} color="#4CAF50" />
            <Text style={styles.symptomText}>Perte de poids inexpliquée</Text>
          </View>
          <View style={styles.symptomItem}>
            <Icon name="eye" size={24} color="#4CAF50" />
            <Text style={styles.symptomText}>Vision floue</Text>
          </View>
          <View style={styles.symptomItem}>
            <Icon name="bacteria" size={24} color="#4CAF50" />
            <Text style={styles.symptomText}>Infections fréquentes</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Les facteurs de risques du diabète de type 2</Text>
        <View style={styles.risksList}>
          <View style={styles.riskItem}>
            <Icon name="weight" size={24} color="#FF5722" />
            <Text style={styles.riskText}>Surpoids/Obesité</Text>
          </View>
          <View style={styles.riskItem}>
            <Icon name="food" size={24} color="#FF5722" />
            <Text style={styles.riskText}>Alimentation riche en sucre/graisse</Text>
          </View>
          <View style={styles.riskItem}>
            <Icon name="sofa" size={24} color="#FF5722" />
            <Text style={styles.riskText}>Mode de vie sédentaire</Text>
          </View>
          <View style={styles.riskItem}>
            <Icon name="dna" size={24} color="#FF5722" />
            <Text style={styles.riskText}>Prédisposition génétique</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Les organes touchés par le diabète</Text>
        <View style={styles.organsContainer}>
          <View style={styles.organRow}>
            <View style={styles.organItem}>
              <Icon name="tooth" size={32} color="#2196F3" />
              <Text style={styles.organText}>Bouche</Text>
            </View>
            <View style={styles.organItem}>
              <Icon name="bone" size={32} color="#2196F3" />
              <Text style={styles.organText}>Articulations</Text>
            </View>
            <View style={styles.organItem}>
              <Icon name="eye" size={32} color="#2196F3" />
              <Text style={styles.organText}>Yeux</Text>
            </View>
          </View>
          <View style={styles.organRow}>
            <View style={styles.organItem}>
              <Icon name="stomach" size={32} color="#2196F3" />
              <Text style={styles.organText}>Pancréas</Text>
            </View>
            <View style={styles.organItem}>
              <Icon name="skull" size={32} color="#2196F3" />
              <Text style={styles.organText}>Foie</Text>
            </View>
          </View>
          <View style={styles.organRow}>
            <View style={styles.organItem}>
              <Icon name="human" size={32} color="#2196F3" />
              <Text style={styles.organText}>Peau</Text>
            </View>
            <View style={styles.organItem}>
              <Icon name="foot-print" size={32} color="#2196F3" />
              <Text style={styles.organText}>Pied</Text>
            </View>
            <View style={styles.organItem}>
              <Icon name="heart-pulse" size={32} color="#2196F3" />
              <Text style={styles.organText}>Système vasculaire</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prévenir le diabète de type 2</Text>
        <View style={styles.preventionList}>
          <View style={styles.preventionItem}>
            <Icon name="doctor" size={24} color="#4CAF50" />
            <Text style={styles.preventionText}>Bilan de santé régulier</Text>
          </View>
          <View style={styles.preventionItem}>
            <Icon name="scale-balance" size={24} color="#4CAF50" />
            <Text style={styles.preventionText}>Contrôler son poids</Text>
          </View>
          <View style={styles.preventionItem}>
            <Icon name="food-apple" size={24} color="#4CAF50" />
            <Text style={styles.preventionText}>Adopter une alimentation équilibrée</Text>
          </View>
          <View style={styles.preventionItem}>
            <Icon name="run" size={24} color="#4CAF50" />
            <Text style={styles.preventionText}>Avoir une activitée physique régulière</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
  <Text style={styles.cardTitle}>Besoin d'aller plus loin ?</Text>
  <Text style={styles.cardSubtitle}>Vous avez des questions ?</Text>
  <Text style={styles.cardText}>Rapprochez-vous de :</Text>
  <View style={styles.contactList}>
    <View style={styles.contactItem}>
      <Icon name="doctor" size={24} color="#2196F3" />
      <Text style={styles.contactText}>Votre médecin traitant et/ou médecin du travail</Text>
    </View>
    <View style={styles.contactItem}>
      <Icon name="hospital-building" size={24} color="#2196F3" />
      <Text style={styles.contactText}>Des infirmièr(e)s dans vos écoles, entreprises, etc...</Text>
    </View>
  </View>
  <TouchableOpacity onPress={() => Linking.openURL('https://www.federationdesdiabetiques.org')}>
    <Text style={[styles.cardText, { color: '#4CAF50', marginTop: 10 }]}>
      En savoir plus sur le site de la Fédération Française des Diabétiques
    </Text>
  </TouchableOpacity>
</View>

      <View style={styles.footerNote}>
  <Text style={styles.footerNoteText}>
    Cette documentation m’a été transmise par l’infirmière Magalie.
  </Text>
</View>


    </ScrollView>
  );

  const renderNutritionContent = () => (
    <ScrollView ref={nutritionRef} style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 10 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Le sucre : un peu, beaucoup, à la folie ou pas du tout ?</Text>
        <Text style={styles.cardText}>
          C'est une source d'énergie essentielle notamment pour le cerveau et les muscles mais tous les
          sucres ne se valent pas !
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>C'est quoi le sucre ?</Text>
        <View style={styles.sugarTypes}>
          <View style={styles.sugarTypeCard}>
            <Icon name="cube-outline" size={32} color="#FF9800" />
            <Text style={styles.sugarTypeTitle}>Sucres simples</Text>
            <Text style={styles.sugarTypeText}>
              De petites tailles et composés de 1 à 3 unités de sucre dit "ose". Ils sont aussi
              ajoutés dans les produits transformés donc "cachés"...
            </Text>
          </View>
          <View style={styles.sugarTypeCard}>
            <Icon name="cube-scan" size={32} color="#4CAF50" />
            <Text style={styles.sugarTypeTitle}>Sucres complexes</Text>
            <Text style={styles.sugarTypeText}>
              Constitués d'une chaîne parfois très complexe. De saveur non sucrées et
              absorbées plus lentement que les glucides simples.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Que se passe t-il quand je mange du sucre ?</Text>
        <Text style={styles.cardText}>
          Et le fameux Index Glycémique (IG) ? Il s'agit de la vitesse d'absorption des glucides.
          Et plus l'aliment est transformé...plus l'IG monte !
        </Text>
        <View style={styles.igContainer}>
          <View style={styles.igCard}>
            <Text style={styles.igTitle}>IG Bas</Text>
            <Icon name="arrow-down" size={24} color="#4CAF50" />
          </View>
          <View style={styles.igCard}>
            <Text style={styles.igTitle}>IG Haut</Text>
            <Icon name="arrow-up" size={24} color="#F44336" />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comment gérer ma consommation de sucre ?</Text>
        <Text style={styles.cardSubtitle}>Pour un adulte avec un apport calorique d'environ 2000 calories :</Text>
        <View style={styles.sugarLimits}>
          <View style={styles.limitItem}>
            <Text style={styles.limitTitle}>Glucides totaux</Text>
            <Text style={styles.limitText}>Environ 225 à 325 grammes/jour soit 50% de nos apports alimentaires !</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitTitle}>Sucres ajoutés</Text>
            <Text style={styles.limitText}>Limiter à 25 gr/jour, selon les recommandations de l'OMS</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>J'évalue le sucre ajouté</Text>
        <Text style={styles.cardText}>
          Objectif : 25 gr de sucres ajoutés par jour c'est environ 5 morceaux de sucre
        </Text>
        <Text style={styles.cardSubtitle}>J'apprends à lire les étiquettes</Text>
        <Text style={styles.cardText}>
          La quantité de sucres : indique la teneur totale de sucres dans l'aliment et précise les sucres
          "simples" par "dont sucres". Les aliments avec le moins de "sucres" sont à privilégier.
        </Text>
        <Text style={styles.cardText}>
          Si pour 100g il y a 30g de sucres cela représente 6 morceaux de sucres
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Je deviens sucrément astucieux !</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Icon name="chef-hat" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>Je cuisine maison des aliments bruts</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="grain" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>Je préfère les céréales les moins raffinées possible</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="cup" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>J'évite les boissons sucrées</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="food-variant-off" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>J'évite les édulcorants</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="factory" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>J'évite les produits industriels</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="silverware-fork-knife" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>Je compose mon repas avec l'assiette idéale</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="run" size={24} color="#4CAF50" />
            <Text style={styles.tipText}>Je pratique une activité physique régulière</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>L'assiette idéale !</Text>
          {renderPlate()}
        <Text style={styles.cardSubtitle}>Vous connaissez la loi Pareto 80/20 ?</Text>
        <Text style={styles.cardText}>• 10 repas selon l'assiette idéale</Text>
        <Text style={styles.cardText}>• 4 repas plaisir par semaine</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Besoin d'aller plus loin ?</Text>
        <Text style={styles.cardSubtitle}>Vous avez des questions ?</Text>
        <Text style={styles.cardText}>
          N'hésitez pas à consulter votre mutuelle, qui peut potentiellement prendre en charge
          un rendez-vous chez un nutritionniste.
        </Text>
        <Text style={styles.cardText}>Rapprochez-vous de :</Text>
        <View style={styles.contactList}>
          <View style={styles.contactItem}>
            <Icon name="doctor" size={24} color="#2196F3" />
            <Text style={styles.contactText}>Votre médecin traitant et/ou médecin du travail</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="hospital-building" size={24} color="#2196F3" />
            <Text style={styles.contactText}>Des infirmièr(e)s des sites de Sopra Steria</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.mangerbouger.fr')}>
          <Text style={[styles.cardText, { color: '#4CAF50', marginTop: 10 }]}>
            En savoir plus sur le site MangerBouger.fr
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diabete' && styles.activeTab]}
          onPress={() => setActiveTab('diabete')}
        >
          <Icon 
            name="diabetes" 
            size={24} 
            color={activeTab === 'diabete' ? '#4CAF50' : '#757575'} 
          />
          <Text style={[styles.tabText, activeTab === 'diabete' && styles.activeTabText]}>
            Le Diabète
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.activeTab]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Icon 
            name="food-apple" 
            size={24} 
            color={activeTab === 'nutrition' ? '#4CAF50' : '#757575'} 
          />
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.activeTabText]}>
            Nutrition
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'diabete' ? renderDiabeteContent() : renderNutritionContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#757575',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  typeContainer: {
    marginTop: 8,
  },
  typeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  symptomsList: {
    marginTop: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  symptomText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  risksList: {
    marginTop: 8,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  organsContainer: {
    marginTop: 16,
  },
  organRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  organItem: {
    alignItems: 'center',
  },
  organText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  preventionList: {
    marginTop: 8,
  },
  preventionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  preventionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  contactList: {
    marginTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flexShrink: 1,
  },
  footerNote: {
  backgroundColor: '#f0f0f0',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
},
footerNoteText: {
  fontSize: 13,
  color: '#555',
  textAlign: 'center',
  fontStyle: 'italic',
},

  // Styles pour la section nutrition
  sugarTypes: {
    marginTop: 8,
  },
  sugarTypeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  sugarTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  sugarTypeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  igContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  igCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '45%',
  },
  igTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sugarLimits: {
    marginTop: 8,
  },
  limitItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  limitText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flexShrink: 1,
  },
  plateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  plateSection: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
  },
  platePart: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateVegetables: {
    backgroundColor: '#4CAF50',
    width: '50%',
    height: '100%',
    left: 0,
  },
  plateStarch: {
    backgroundColor: '#FFC107',
    width: '25%',
    height: '100%',
    left: '50%',
  },
  plateProtein: {
    backgroundColor: '#F44336',
    width: '25%',
    height: '100%',
    left: '75%',
  },
  plateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    padding: 5,
  },
  plateLegend: {
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
legendRow: {
  marginTop: 16,
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
legendColor: {
  width: 12,
  height: 12,
  borderRadius: 6,
  marginRight: 8,
},
legendLabel: {
  fontSize: 14,
  color: '#333',
},


});

export default EducationScreen;