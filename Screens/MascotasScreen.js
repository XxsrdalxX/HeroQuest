import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MascotasScreen({ navigation }) {
  const [currentPet, setCurrentPet] = useState(null);
  const [availablePets, setAvailablePets] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userExp, setUserExp] = useState(0);
  const [lastFeedTime, setLastFeedTime] = useState(null);
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [selectedPetForAdopt, setSelectedPetForAdopt] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [petHappiness, setPetHappiness] = useState(100);

  // Base de datos de mascotas épicas
  const petDatabase = [
    {
      id: 'baby_dragon',
      name: 'Dragoncito',
      emoji: '🐲',
      rarity: 'Común',
      color: '#FF6B6B',
      unlockLevel: 1,
      description: 'Un pequeño dragón que escupe chispas de alegría',
      stats: { attack: 5, defense: 3, magic: 7 },
      evolution: 'young_dragon',
      feedBonus: 5,
      abilities: ['Chispa Motivadora', 'Rugido de Ánimo'],
      isBaseForm: true, // ¡NUEVO! Es la mascota inicial
    },
    {
      id: 'young_dragon',
      name: 'Dragón Joven',
      emoji: '🐉',
      rarity: 'Raro',
      color: '#4ECDC4',
      unlockLevel: 5,
      description: 'Un dragón adolescente con poder creciente',
      stats: { attack: 12, defense: 8, magic: 15 },
      evolution: 'ancient_dragon',
      feedBonus: 10,
      abilities: ['Aliento de Fuego', 'Protección Mágica', 'Inspiración']
    },
    {
      id: 'ancient_dragon',
      name: 'Dragón Ancestral',
      emoji: '🔥🐉',
      rarity: 'Legendario',
      color: '#FFD700',
      unlockLevel: 15,
      description: 'Sabiduría milenaria en forma de dragón',
      stats: { attack: 25, defense: 20, magic: 30 },
      evolution: null,
      feedBonus: 20,
      abilities: ['Llamarada Épica', 'Barrera Ancestral', 'Sabiduría Infinita']
    },
    {
      id: 'phoenix_chick',
      name: 'Polluelo Fénix',
      emoji: '🐣',
      rarity: 'Común',
      color: '#FF9800',
      unlockLevel: 3,
      description: 'Un ave mítica renace de sus cenizas',
      stats: { attack: 3, defense: 5, magic: 8 },
      evolution: 'phoenix',
      feedBonus: 7,
      abilities: ['Renacimiento', 'Curación Menor'],
      isBaseForm: true,
    },
    {
      id: 'phoenix',
      name: 'Fénix Dorado',
      emoji: '🔥🦅',
      rarity: 'Épico',
      color: '#E91E63',
      unlockLevel: 10,
      description: 'Ave inmortal de fuego y renacimiento',
      stats: { attack: 18, defense: 15, magic: 25 },
      evolution: null,
      feedBonus: 15,
      abilities: ['Renacimiento Épico', 'Llamas Sanadoras', 'Vuelo Infinito']
    },
    {
      id: 'crystal_wolf',
      name: 'Lobo de Cristal',
      emoji: '🐺',
      rarity: 'Raro',
      color: '#9C27B0',
      unlockLevel: 7,
      description: 'Un lobo hecho de cristales mágicos',
      stats: { attack: 15, defense: 12, magic: 10 },
      evolution: 'alpha_crystal_wolf',
      feedBonus: 12,
      abilities: ['Aullido Cristalino', 'Velocidad de Cristal'],
      isBaseForm: true,
    },
    {
      id: 'alpha_crystal_wolf',
      name: 'Lobo Alfa de Cristal',
      emoji: '🌌🐺',
      rarity: 'Legendario',
      color: '#7B1FA2',
      unlockLevel: 18,
      description: 'Líder de la manada de cristal, invocado por las estrellas',
      stats: { attack: 28, defense: 22, magic: 18 },
      evolution: null,
      feedBonus: 22,
      abilities: ['Tormenta de Fragmentos', 'Defensa Gélida', 'Liderazgo Astral']
    },
    {
      id: 'unicorn',
      name: 'Unicornio Bebé',
      emoji: '🦄',
      rarity: 'Épico',
      color: '#E1BEE7',
      unlockLevel: 12,
      description: 'Pureza y magia en su forma más tierna',
      stats: { attack: 8, defense: 10, magic: 20 },
      evolution: 'elder_unicorn',
      feedBonus: 18,
      abilities: ['Bendición Pura', 'Curación Mágica', 'Protección Divina'],
      isBaseForm: true,
    },
    {
      id: 'elder_unicorn',
      name: 'Unicornio Ancestral',
      emoji: '✨🦄',
      rarity: 'Legendario',
      color: '#BA68C8',
      unlockLevel: 20,
      description: 'La encarnación de la esperanza y la magia pura',
      stats: { attack: 15, defense: 20, magic: 35 },
      evolution: null,
      feedBonus: 25,
      abilities: ['Campo de Égida', 'Milagro Divino', 'Purificación Total']
    },
    {
      id: 'slime_hatchling',
      name: 'Renacuajo Slime',
      emoji: '🦠',
      rarity: 'Común',
      color: '#8BC34A',
      unlockLevel: 2,
      description: 'Una pequeña masa gelatinosa, sorprendentemente amistosa',
      stats: { attack: 2, defense: 2, magic: 2 },
      evolution: 'giant_slime',
      feedBonus: 4,
      abilities: ['Pegote Feliz', 'Dulzura Empalagosa'],
      isBaseForm: true,
    },
    {
      id: 'giant_slime',
      name: 'Slime Gigante',
      emoji: '🟢',
      rarity: 'Raro',
      color: '#689F38',
      unlockLevel: 8,
      description: 'Un slime enorme que absorbe los problemas',
      stats: { attack: 10, defense: 15, magic: 8 },
      evolution: null,
      feedBonus: 10,
      abilities: ['Absorción Defensiva', 'Salpicadura Creciente']
    },
    {
      id: 'baby_griffin',
      name: 'Grifo Polluelo',
      emoji: '🐥',
      rarity: 'Raro',
      color: '#FFEB3B',
      unlockLevel: 6,
      description: 'Un polluelo de grifo con sueños de volar alto',
      stats: { attack: 7, defense: 6, magic: 6 },
      evolution: 'majestic_griffin',
      feedBonus: 10,
      abilities: ['Picotazo Veloz', 'Alas de Viento'],
      isBaseForm: true,
    },
    {
      id: 'majestic_griffin',
      name: 'Grifo Majestuoso',
      emoji: '🦅🦁',
      rarity: 'Épico',
      color: '#FFC107',
      unlockLevel: 14,
      description: 'Orgullo de los cielos, con garras afiladas y noble corazón',
      stats: { attack: 20, defense: 18, magic: 12 },
      evolution: null,
      feedBonus: 18,
      abilities: ['Vuelo Supersónico', 'Garras Doradas', 'Mirada Intimidante']
    },
    {
      id: 'mystic_owl',
      name: 'Búho Místico',
      emoji: '🦉',
      rarity: 'Raro',
      color: '#607D8B',
      unlockLevel: 9,
      description: 'Un sabio búho que guarda secretos ancestrales',
      stats: { attack: 6, defense: 8, magic: 18 },
      evolution: 'elder_owl',
      feedBonus: 14,
      abilities: ['Visión Nocturna', 'Sabiduría Antigua'],
      isBaseForm: true,
    },
    {
      id: 'elder_owl',
      name: 'Búho Sabio',
      emoji: '🔮🦉',
      rarity: 'Legendario',
      color: '#455A64',
      unlockLevel: 19,
      description: 'El guardián del conocimiento arcano y la magia estelar',
      stats: { attack: 12, defense: 15, magic: 30 },
      evolution: null,
      feedBonus: 24,
      abilities: ['Clarividencia', 'Hechizo del Sueño', 'Dominio Astral']
    },
    {
      id: 'stone_golem_fledgling',
      name: 'Gólem de Roca Joven',
      emoji: '🪨',
      rarity: 'Común',
      color: '#795548',
      unlockLevel: 4,
      description: 'Un pequeño gólem de roca, lento pero resistente',
      stats: { attack: 8, defense: 10, magic: 1 },
      evolution: 'ancient_golem',
      feedBonus: 6,
      abilities: ['Piel de Piedra', 'Golpe Fuerte'],
      isBaseForm: true,
    },
    {
      id: 'ancient_golem',
      name: 'Gólem Ancestral',
      emoji: '🗿',
      rarity: 'Épico',
      color: '#5D4037',
      unlockLevel: 13,
      description: 'Un coloso de piedra con una fuerza imparable',
      stats: { attack: 22, defense: 25, magic: 5 },
      evolution: null,
      feedBonus: 16,
      abilities: ['Terremoto', 'Escudo Rocoso', 'Defensa Implacable']
    }
  ];

  useEffect(() => {
    loadPetData();
    loadUserData();
    startPetAnimations();
  }, []);

  useEffect(() => {
    if (currentPet && userLevel > 0) {
      checkAutoEvolution();
    }
  }, [userLevel, currentPet]);

  const loadUserData = async () => {
    const level = await AsyncStorage.getItem('userLevel');
    const exp = await AsyncStorage.getItem('userExp');
    if (level) {
      const newLevel = parseInt(level);
      setUserLevel(newLevel);
    }
    if (exp) setUserExp(parseInt(exp));
  };

  const loadPetData = async () => {
    try {
      const savedPet = await AsyncStorage.getItem('currentPet');
      const savedAvailable = await AsyncStorage.getItem('availablePets');
      const savedFeedTime = await AsyncStorage.getItem('lastFeedTime');
      const savedHappiness = await AsyncStorage.getItem('petHappiness');
      
      const basePets = petDatabase.filter(pet => pet.isBaseForm);

      if (savedPet) {
        setCurrentPet(JSON.parse(savedPet));
      }

      if (savedAvailable) {
        const available = JSON.parse(savedAvailable);
        // Si la lista guardada no contiene todas las mascotas base,
        // la actualizamos.
        if (available.length < basePets.length) {
          setAvailablePets(basePets);
          await AsyncStorage.setItem('availablePets', JSON.stringify(basePets));
        } else {
          setAvailablePets(available);
        }
      } else {
        // Primera vez, carga TODA la base de datos de mascotas iniciales.
        setAvailablePets(basePets);
        await AsyncStorage.setItem('availablePets', JSON.stringify(basePets));
      }

      if (savedFeedTime) {
        setLastFeedTime(new Date(savedFeedTime));
      }
      if (savedHappiness) {
        setPetHappiness(parseInt(savedHappiness));
      }
    } catch (error) {
      console.log('Error loading pet data:', error);
    }
  };

  const startPetAnimations = () => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    bounce();
  };

  const adoptPet = async (pet) => {
    setCurrentPet(pet);
    setPetHappiness(100);
    await AsyncStorage.setItem('currentPet', JSON.stringify(pet));
    await AsyncStorage.setItem('petHappiness', '100');

    setPetModalVisible(false);

    Alert.alert(
      '🎉 ¡Nueva Mascota!',
      `¡${pet.name} se ha unido a tu aventura! ${pet.emoji}`,
      [{ text: 'Genial!', style: 'default' }]
    );
  };

  const feedPet = async () => {
    if (!currentPet) return;

    const now = new Date();
    const timeSinceLastFeed = lastFeedTime ? (now - lastFeedTime) / (1000 * 60 * 60) : 24; // horas

    if (timeSinceLastFeed < 2) {
      Alert.alert(
        '🍖 Mascota llena',
        `${currentPet.name} aún está satisfecho. Vuelve en ${Math.ceil(2 - timeSinceLastFeed)} hora(s).`
      );
      return;
    }

    // Dar EXP bonus
    const currentUserExp = await AsyncStorage.getItem('userExp');
    const newExp = (parseInt(currentUserExp) || 0) + currentPet.feedBonus;
    await AsyncStorage.setItem('userExp', newExp.toString());

    // Aumentar felicidad
    const newHappiness = Math.min(100, petHappiness + 20);
    setPetHappiness(newHappiness);

    setLastFeedTime(now);
    await AsyncStorage.setItem('lastFeedTime', now.toISOString());
    await AsyncStorage.setItem('petHappiness', newHappiness.toString());

    Alert.alert(
      '🍖 ¡Mascota alimentada!',
      `${currentPet.name} está feliz y te ha dado +${currentPet.feedBonus} EXP!`,
      [{ text: 'Genial!', style: 'default' }]
    );

    // Verificar evolución
    checkEvolution();
  };

  const checkEvolution = async () => {
    if (!currentPet || !currentPet.evolution) return;

    const evolutionPet = petDatabase.find(pet => pet.id === currentPet.evolution);
    if (!evolutionPet) return;

    if (userLevel >= evolutionPet.unlockLevel && petHappiness >= 80) {
      Alert.alert(
        '✨ ¡EVOLUCIÓN DISPONIBLE!',
        `${currentPet.name} siente una energía especial y puede evolucionar a ${evolutionPet.name}!`,
        [
          { text: 'Ahora no', style: 'cancel' },
          {
            text: 'Evolucionar!',
            style: 'default',
            onPress: () => evolvePet(evolutionPet)
          }
        ]
      );
    }
  };

  const checkAutoEvolution = async () => {
    if (!currentPet || !currentPet.evolution) return;

    const evolutionPet = petDatabase.find(pet => pet.id === currentPet.evolution);
    if (!evolutionPet) return;

    // Verificar si puede evolucionar automáticamente por nivel
    if (userLevel >= evolutionPet.unlockLevel && petHappiness >= 60) {
      // Notificar evolución automática
      Alert.alert(
        '🌟 ¡EVOLUCIÓN AUTOMÁTICA!',
        `¡Tu nivel ${userLevel} ha despertado el poder oculto de ${currentPet.name}!\n\n${evolutionPet.emoji} ¡Se ha transformado en ${evolutionPet.name}!`,
        [
          {
            text: '¡Increíble!',
            style: 'default',
            onPress: () => evolvePet(evolutionPet)
          }
        ]
      );
    }
  };

  const evolvePet = async (evolutionPet) => {
    // Animación especial de evolución
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setCurrentPet(evolutionPet);
    await AsyncStorage.setItem('currentPet', JSON.stringify(evolutionPet));

    // Bonus EXP por evolución
    const currentUserExp = await AsyncStorage.getItem('userExp');
    const bonusExp = 50;
    const newExp = (parseInt(currentUserExp) || 0) + bonusExp;
    await AsyncStorage.setItem('userExp', newExp.toString());

    setTimeout(() => {
      Alert.alert(
        '🌟 ¡EVOLUCIÓN COMPLETA!',
        `¡${evolutionPet.name} ha despertado con nuevos poderes!\n\n🎁 Bonus: +${bonusExp} EXP por evolución`,
        [{ text: 'Asombroso!', style: 'default' }]
      );
    }, 1000);
  };

  const unlockNewPets = async () => {
    const newUnlocks = petDatabase.filter(pet =>
      pet.unlockLevel <= userLevel &&
      !availablePets.some(available => available.id === pet.id)
    );

    if (newUnlocks.length > 0) {
      const updatedAvailable = [...availablePets, ...newUnlocks];
      setAvailablePets(updatedAvailable);
      await AsyncStorage.setItem('availablePets', JSON.stringify(updatedAvailable));
    }
  };

  useEffect(() => {
    unlockNewPets();
  }, [userLevel]);

  const getRarityColor = (rarity) => {
    const colors = {
      'Común': '#4CAF50',
      'Raro': '#2196F3',
      'Épico': '#9C27B0',
      'Legendario': '#FFD700'
    };
    return colors[rarity] || '#666';
  };

  const canFeedPet = () => {
    if (!lastFeedTime) return true;
    const timeSinceLastFeed = (new Date() - lastFeedTime) / (1000 * 60 * 60);
    return timeSinceLastFeed >= 2;
  };

  const canEvolve = () => {
    if (!currentPet || !currentPet.evolution) return false;
    const evolutionPet = petDatabase.find(pet => pet.id === currentPet.evolution);
    if (!evolutionPet) return false;
    return userLevel >= evolutionPet.unlockLevel && petHappiness >= 60;
  };

  const getEvolutionProgress = () => {
    if (!currentPet || !currentPet.evolution) return null;
    const evolutionPet = petDatabase.find(pet => pet.id === currentPet.evolution);
    if (!evolutionPet) return null;

    const levelReady = userLevel >= evolutionPet.unlockLevel;
    const happinessReady = petHappiness >= 60;

    return {
      evolutionPet,
      levelReady,
      happinessReady,
      canEvolve: levelReady && happinessReady
    };
  };

  const getHappinessEmoji = () => {
    if (petHappiness >= 80) return '😍';
    if (petHappiness >= 60) return '😊';
    if (petHappiness >= 40) return '😐';
    if (petHappiness >= 20) return '😔';
    return '😢';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>🏰 BESTIARIO REAL 🏰</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mascota actual */}
        {currentPet ? (
          <View style={styles.currentPetContainer}>
            <Text style={styles.sectionTitle}>👑 Tu Compañero Leal</Text>

            <View style={[styles.petCard, styles.currentPetCard, { borderColor: currentPet.color }]}>
              <Animated.Text
                style={[styles.currentPetEmoji, { transform: [{ scale: scaleAnim }] }]}
              >
                {currentPet.emoji}
              </Animated.Text>

              <View style={styles.petInfo}>
                <Text style={styles.petName}>{currentPet.name}</Text>
                <Text style={[styles.petRarity, { color: getRarityColor(currentPet.rarity) }]}>
                  ✨ {currentPet.rarity}
                </Text>
                <Text style={styles.petDescription}>{currentPet.description}</Text>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>⚔️</Text>
                    <Text style={styles.statValue}>{currentPet.stats.attack}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>🛡️</Text>
                    <Text style={styles.statValue}>{currentPet.stats.defense}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>✨</Text>
                    <Text style={styles.statValue}>{currentPet.stats.magic}</Text>
                  </View>
                </View>

                {/* Barra de felicidad */}
                <View style={styles.happinessContainer}>
                  <View style={styles.happinessHeader}>
                    <Text style={styles.happinessLabel}>
                      {getHappinessEmoji()} Felicidad: {petHappiness}%
                    </Text>
                  </View>
                  <View style={styles.happinessBarContainer}>
                    <View style={[styles.happinessBar, { width: `${petHappiness}%` }]} />
                  </View>
                </View>

                {/* Indicador de evolución */}
                {getEvolutionProgress() && (
                  <View style={styles.evolutionContainer}>
                    <View style={styles.evolutionHeader}>
                      <Text style={styles.evolutionTitle}>
                        ✨ Próxima Evolución: {getEvolutionProgress().evolutionPet.name}
                      </Text>
                    </View>
                    <View style={styles.evolutionRequirements}>
                      <View style={[styles.requirement, {
                        backgroundColor: getEvolutionProgress().levelReady ? '#4CAF50' : '#666'
                      }]}>
                        <Text style={styles.requirementText}>
                          Nivel {getEvolutionProgress().evolutionPet.unlockLevel}+
                        </Text>
                        <Text style={styles.requirementStatus}>
                          {getEvolutionProgress().levelReady ? '✅' : `${userLevel}/${getEvolutionProgress().evolutionPet.unlockLevel}`}
                        </Text>
                      </View>
                      <View style={[styles.requirement, {
                        backgroundColor: getEvolutionProgress().happinessReady ? '#4CAF50' : '#666'
                      }]}>
                        <Text style={styles.requirementText}>Felicidad 60%+</Text>
                        <Text style={styles.requirementStatus}>
                          {getEvolutionProgress().happinessReady ? '✅' : `${petHappiness}%`}
                        </Text>
                      </View>
                    </View>
                    {canEvolve() && (
                      <TouchableOpacity
                        style={styles.evolveButton}
                        onPress={() => evolvePet(getEvolutionProgress().evolutionPet)}
                      >
                        <Text style={styles.evolveButtonText}>
                          🌟 ¡EVOLUCIONAR AHORA! 🌟
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: canFeedPet() ? '#4CAF50' : '#666' }
                ]}
                onPress={feedPet}
                disabled={!canFeedPet()}
              >
                <Ionicons name="restaurant" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>
                  Alimentar (+{currentPet.feedBonus} EXP)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={() => setPetModalVisible(true)}
              >
                <Ionicons name="swap-horizontal" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Cambiar</Text>
              </TouchableOpacity>
            </View>

            {/* Habilidades */}
            <View style={styles.abilitiesContainer}>
              <Text style={styles.abilitiesTitle}>🎯 Habilidades Especiales</Text>
              <View style={styles.abilitiesList}>
                {currentPet.abilities.map((ability, index) => (
                  <View key={index} style={styles.abilityItem}>
                    <Text style={styles.abilityText}>• {ability}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noPetContainer}>
            <Text style={styles.noPetEmoji}>🥚</Text>
            <Text style={styles.noPetTitle}>Sin Compañero</Text>
            <Text style={styles.noPetText}>
              ¡Adopta tu primera mascota para comenzar la aventura!
            </Text>
            <TouchableOpacity
              style={styles.adoptButton}
              onPress={() => setPetModalVisible(true)}
            >
              <Text style={styles.adoptButtonText}>🐣 Adoptar Mascota</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mascotas disponibles preview */}
        <View style={styles.availableContainer}>
          <Text style={styles.sectionTitle}>
            🏪 Mascotas Disponibles ({availablePets.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availablePets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.miniPetCard, { borderColor: pet.color }]}
                onPress={() => {
                  setSelectedPetForAdopt(pet);
                  setPetModalVisible(true);
                }}
              >
                <Text style={styles.miniPetEmoji}>{pet.emoji}</Text>
                <Text style={styles.miniPetName}>{pet.name}</Text>
                <Text style={[styles.miniPetRarity, { color: getRarityColor(pet.rarity) }]}>
                  {pet.rarity}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modal de adopción/cambio */}
      <Modal visible={petModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🏰 BESTIARIO DEL REINO</Text>

            <ScrollView style={styles.modalPetsList}>
              {availablePets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.modalPetCard, { borderLeftColor: pet.color }]}
                  onPress={() => adoptPet(pet)}
                >
                  <Text style={styles.modalPetEmoji}>{pet.emoji}</Text>
                  <View style={styles.modalPetInfo}>
                    <Text style={styles.modalPetName}>{pet.name}</Text>
                    <Text style={[styles.modalPetRarity, { color: getRarityColor(pet.rarity) }]}>
                      {pet.rarity} • Nivel {pet.unlockLevel}+
                    </Text>
                    <Text style={styles.modalPetDescription}>{pet.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPetModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  currentPetContainer: {
    padding: 20,
  },
  petCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 15,
    padding: 20,
    borderWidth: 3,
    alignItems: 'center',
  },
  currentPetCard: {
    marginBottom: 20,
  },
  currentPetEmoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  petInfo: {
    alignItems: 'center',
    width: '100%',
  },
  petName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  petRarity: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  petDescription: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    padding: 10,
    borderRadius: 10,
    minWidth: 60,
  },
  statLabel: {
    fontSize: 20,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  happinessContainer: {
    width: '100%',
  },
  happinessHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  happinessLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  happinessBarContainer: {
    height: 8,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    overflow: 'hidden',
  },
  happinessBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  evolutionContainer: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  evolutionHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  evolutionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  evolutionRequirements: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  requirement: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  requirementText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementStatus: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  evolveButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  evolveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  abilitiesContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 15,
    padding: 20,
  },
  abilitiesTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  abilitiesList: {
    alignItems: 'flex-start',
  },
  abilityItem: {
    marginBottom: 5,
  },
  abilityText: {
    color: '#4ECDC4',
    fontSize: 14,
  },
  noPetContainer: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  noPetEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  noPetTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noPetText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  adoptButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  adoptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  availableContainer: {
    padding: 20,
  },
  miniPetCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    width: 120,
  },
  miniPetEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  miniPetName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  miniPetRarity: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalPetsList: {
    maxHeight: 400,
  },
  modalPetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  modalPetEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  modalPetInfo: {
    flex: 1,
  },
  modalPetName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalPetRarity: {
    fontSize: 12,
    marginBottom: 4,
  },
  modalPetDescription: {
    color: '#aaa',
    fontSize: 12,
  },
  modalCloseButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});