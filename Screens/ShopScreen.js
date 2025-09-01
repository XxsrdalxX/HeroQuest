// Screens/ShopScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Dimensions,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Base de datos de la tienda medieval
const shopDatabase = [
  {
    id: 'potion_health',
    name: 'Poción de Vida',
    emoji: '🧪',
    description: 'Elixir rojo que restaura tu energía vital',
    price: 50,
    color: '#E74C3C',
    rarity: 'Común',
  },
  {
    id: 'scroll_wisdom',
    name: 'Pergamino Ancestral',
    emoji: '📜',
    description: 'Conocimiento de los antiguos maestros',
    price: 150,
    color: '#F39C12',
    rarity: 'Raro',
  },
  {
    id: 'chest_treasure',
    name: 'Cofre del Dragón',
    emoji: '📦',
    description: 'Tesoro guardado por siglos en las montañas',
    price: 300,
    color: '#FFD700',
    rarity: 'Épico',
  },
  {
    id: 'rune_power',
    name: 'Runa de Poder',
    emoji: '⚡',
    description: 'Piedra mágica imbuida con energía primordial',
    price: 500,
    color: '#9B59B6',
    rarity: 'Legendario',
  },
  {
    id: 'armor_knight',
    name: 'Armadura Real',
    emoji: '🛡️',
    description: 'Protección forjada en las fraguas del reino',
    price: 200,
    color: '#3498DB',
    rarity: 'Raro',
  },
  {
    id: 'sword_flame',
    name: 'Espada Flamígera',
    emoji: '🗡️',
    description: 'Hoja bendecida por el fuego eterno',
    price: 400,
    color: '#E67E22',
    rarity: 'Épico',
  },
  {
    id: 'gem_crystal',
    name: 'Gema de Cristal',
    emoji: '💎',
    description: 'Cristal puro con poderes de sanación',
    price: 250,
    color: '#1ABC9C',
    rarity: 'Raro',
  },
  {
    id: 'ring_magic',
    name: 'Anillo Mágico',
    emoji: '💍',
    description: 'Joya encantada de los hechiceros',
    price: 350,
    color: '#8E44AD',
    rarity: 'Épico',
  },
];

export default function ShopScreen({ navigation }) {
  const [userGold, setUserGold] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todo', icon: '🏰' },
    { id: 'potions', name: 'Pociones', icon: '🧪' },
    { id: 'weapons', name: 'Armas', icon: '⚔️' },
    { id: 'armor', name: 'Armadura', icon: '🛡️' },
    { id: 'magic', name: 'Mágicos', icon: '✨' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadUserGold();
    }, [])
  );

  const loadUserGold = async () => {
    try {
      const savedGold = await AsyncStorage.getItem('userGold');
      if (savedGold) {
        setUserGold(parseInt(savedGold));
      } else {
        await AsyncStorage.setItem('userGold', '1000');
        setUserGold(1000);
      }
    } catch (e) {
      console.error('Error al cargar el oro:', e);
    }
  };

  const handlePurchase = async (item) => {
    if (userGold >= item.price) {
      const newGold = userGold - item.price;
      setUserGold(newGold);
      await AsyncStorage.setItem('userGold', newGold.toString());
      
      Alert.alert(
        '🎉 ¡Compra Realizada!',
        `Has adquirido "${item.name}" por ${item.price} monedas de oro.\n\nEl objeto ha sido añadido a tu inventario.`,
        [{ text: '¡Excelente!', style: 'default' }]
      );
    } else {
      Alert.alert(
        '💰 Oro Insuficiente',
        `Te faltan ${item.price - userGold} monedas de oro para adquirir "${item.name}".\n\nCompleta más misiones para ganar oro.`,
        [{ text: 'Entendido', style: 'cancel' }]
      );
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'Común': '#27AE60',
      'Raro': '#3498DB',
      'Épico': '#9B59B6',
      'Legendario': '#F1C40F'
    };
    return colors[rarity] || '#95A5A6';
  };

  const getFilteredItems = () => {
    if (selectedCategory === 'all') return shopDatabase;
    
    const filters = {
      'potions': ['potion_health', 'gem_crystal'],
      'weapons': ['sword_flame'],
      'armor': ['armor_knight', 'ring_magic'],
      'magic': ['scroll_wisdom', 'chest_treasure', 'rune_power'],
    };
    
    return shopDatabase.filter(item => filters[selectedCategory]?.includes(item.id));
  };

  return (
    <View style={styles.container}>
      {/* Fondo medieval */}
      <View style={styles.backgroundPattern} />
      
      {/* Header medieval */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.pixelButton}>
            <Ionicons name="arrow-back" size={20} color="#FFD700" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>🏪 TIENDA DEL REINO 🏪</Text>
          <Text style={styles.subtitle}>~ Mercader Real ~</Text>
        </View>
        
        <View style={styles.goldDisplay}>
          <View style={styles.coinIcon}>
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
          <Text style={styles.goldAmount}>{userGold}</Text>
        </View>
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de productos */}
      <ScrollView 
        style={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          ✨ ARTÍCULOS MÁGICOS ✨
        </Text>

        <View style={styles.itemsGrid}>
          {getFilteredItems().map((item) => (
            <View key={item.id} style={styles.itemCard}>
              {/* Badge de rareza */}
              <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
                <Text style={styles.rarityText}>{item.rarity}</Text>
              </View>

              {/* Contenido del item */}
              <View style={styles.itemHeader}>
                <View style={styles.itemEmojiContainer}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>

              {/* Footer con precio y botón */}
              <View style={styles.itemFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Precio:</Text>
                  <View style={styles.priceDisplay}>
                    <Text style={styles.coinSmall}>🪙</Text>
                    <Text style={styles.priceAmount}>{item.price}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    userGold < item.price && styles.buyButtonDisabled
                  ]}
                  onPress={() => handlePurchase(item)}
                  disabled={userGold < item.price}
                >
                  <Text style={styles.buyButtonText}>
                    {userGold >= item.price ? 'COMPRAR' : 'SIN ORO'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Footer de la tienda */}
        <View style={styles.shopFooter}>
          <Text style={styles.footerText}>
            🏰 Mercader autorizado por el Reino 🏰
          </Text>
          <Text style={styles.footerSubtext}>
            "Los mejores objetos para los mejores héroes"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C5F41',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2C5F41',
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#1A3A2A',
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelButton: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: '#DDD',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  goldDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  coinIcon: {
    marginRight: 6,
  },
  coinEmoji: {
    fontSize: 20,
  },
  goldAmount: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoriesContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#1A3A2A',
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513',
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#2C5F41',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B4513',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#FFD700',
    borderColor: '#8B4513',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    color: '#DDD',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  productsContainer: {
    flex: 1,
    backgroundColor: '#2C5F41',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  itemsGrid: {
    paddingHorizontal: 15,
  },
  itemCard: {
    backgroundColor: '#1A3A2A',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#8B4513',
    marginBottom: 20,
    padding: 15,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  rarityBadge: {
    position: 'absolute',
    top: -8,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    zIndex: 1,
  },
  rarityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  itemEmojiContainer: {
    backgroundColor: '#2C5F41',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 40,
  },
  itemContent: {
    alignItems: 'center',
    marginBottom: 15,
  },
  itemName: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemDescription: {
    color: '#DDD',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#8B4513',
    paddingTop: 12,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  coinSmall: {
    fontSize: 16,
    marginRight: 5,
  },
  priceAmount: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#32CD32',
    minWidth: 100,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#888',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  shopFooter: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1A3A2A',
    marginTop: 20,
    borderTopWidth: 3,
    borderTopColor: '#FFD700',
  },
  footerText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    color: '#DDD',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});