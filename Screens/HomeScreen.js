import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // ¡NUEVO!

const { width } = Dimensions.get('window');

// Datos por defecto para el perfil y logros
const defaultHeroProfile = {
  name: 'Héroe Anónimo',
  avatar: 'https://i.pinimg.com/1200x/60/56/ad/6056ada4d871c8d345cc124c16754ab6.jpg',
};

const defaultStats = {
  missionsCompleted: 0,
  daysActive: 0,
  totalExp: 0,
  petsAdopted: 0,
};

const defaultAchievements = [
  { id: 1, title: 'Iniciado', description: 'Completa tu primera misión', completed: false, requiredMissions: 1 },
  { id: 2, title: 'Aprendiz Aventurero', description: 'Completa 10 misiones', completed: false, requiredMissions: 10 },
  { id: 3, title: 'Novato de la Caza', description: 'Adopta tu primera mascota', completed: false, requiredPets: 1 },
  { id: 4, title: 'Veterano', description: 'Inicia sesión 7 días seguidos', completed: false, requiredDays: 7 },
  { id: 5, title: 'Mago en Formación', description: 'Obtén 1000 de EXP', completed: false, requiredExp: 1000 },
];

export default function HomeScreen({ navigation }) {
  // Estado para el perfil del usuario
  const [userName, setUserName] = useState(defaultHeroProfile.name);
  const [userAvatar, setUserAvatar] = useState(defaultHeroProfile.avatar);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Estado para las estadísticas
  const [userLevel, setUserLevel] = useState(1);
  const [userExp, setUserExp] = useState(0);
  const [stats, setStats] = useState(defaultStats);
  const [achievements, setAchievements] = useState(defaultAchievements);

  // Estado para las misiones (manteniendo tu lógica)
  const [completedMissionsToday, setCompletedMissionsToday] = useState(0);
  const [totalMissions, setTotalMissions] = useState(0);

  // Animaciones
  const [scaleValue] = useState(new Animated.Value(1));

  // --- LÓGICA DE CARGA DE DATOS Y EFECTOS ---
  // Ahora usamos useFocusEffect para recargar la pantalla al volver a ella
  useFocusEffect(
    React.useCallback(() => {
      loadAllData();
      checkAchievements();
    }, [])
  );
  
  // Mantenemos la animación en un useEffect para que no se reinicie
  useEffect(() => {
    startPulseAnimation();
  }, []);

  const loadAllData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('userName');
      const savedLevel = await AsyncStorage.getItem('userLevel');
      const savedExp = await AsyncStorage.getItem('userExp');
      const savedStats = await AsyncStorage.getItem('heroStats');
      const savedAchievements = await AsyncStorage.getItem('heroAchievements');
      const lastLogin = await AsyncStorage.getItem('lastLoginDate');
      

      const missions = await AsyncStorage.getItem('epicMissions');
      const completedMissions = await AsyncStorage.getItem('epicCompletedMissions');
      const dailyQuests = await AsyncStorage.getItem('dailyQuests');
      
      // Cargar datos de perfil
      if (savedName) setUserName(savedName);
      
      // Siempre usar la nueva imagen de perfil
      setUserAvatar(defaultHeroProfile.avatar);
      await AsyncStorage.setItem('userAvatar', defaultHeroProfile.avatar);

      // Cargar datos de misiones (tu lógica original)
      if (completedMissions) {
        setCompletedMissionsToday(JSON.parse(completedMissions).length);
      }
      if (missions) {
        setTotalMissions(JSON.parse(missions).length);
      }
      
      // Cargar y actualizar estadísticas
      const currentStats = savedStats ? JSON.parse(savedStats) : defaultStats;
      const today = new Date().toDateString();
      if (lastLogin !== today) {
        currentStats.daysActive++;
        await AsyncStorage.setItem('lastLoginDate', today);
      }
      
      const parsedLevel = parseInt(savedLevel) || 1;
      const parsedExp = parseInt(savedExp) || 0;

      setUserLevel(parsedLevel);
      setUserExp(parsedExp);
      
      currentStats.totalExp = parsedExp;
      currentStats.missionsCompleted = completedMissionsToday;
      setStats(currentStats);
      await AsyncStorage.setItem('heroStats', JSON.stringify(currentStats));

      // Cargar y actualizar logros
      const achievementsData = savedAchievements ? JSON.parse(savedAchievements) : defaultAchievements;
      setAchievements(achievementsData);

    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const startPulseAnimation = () => {
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    pulseAnimation();
  };

  const saveHeroName = async () => {
    try {
      if (tempName.trim().length > 0) {
        setUserName(tempName.trim());
        await AsyncStorage.setItem('userName', tempName.trim());
        setEditingName(false);
      } else {
        Alert.alert('Error', 'El nombre no puede estar vacío.');
      }
    } catch (e) {
      console.error('Error al guardar el nombre:', e);
    }
  };

  // Función que mantiene la imagen fija
  const changeAvatar = () => {
    // No hacer nada al tocar el avatar
    return;
  };

  const checkAchievements = async () => {
    const achievementsData = JSON.parse(await AsyncStorage.getItem('heroAchievements')) || defaultAchievements;
    const statsData = JSON.parse(await AsyncStorage.getItem('heroStats')) || defaultStats;
    
    const updatedAchievements = achievementsData.map(ach => {
      let isCompleted = ach.completed;
      if (!isCompleted && ach.requiredMissions && statsData.missionsCompleted >= ach.requiredMissions) {
        isCompleted = true;
      }
      if (!isCompleted && ach.requiredDays && statsData.daysActive >= ach.requiredDays) {
        isCompleted = true;
      }
      if (!isCompleted && ach.requiredExp && statsData.totalExp >= ach.requiredExp) {
        isCompleted = true;
      }
      if (!isCompleted && ach.requiredPets && statsData.petsAdopted >= ach.requiredPets) {
        isCompleted = true;
      }
      return { ...ach, completed: isCompleted };
    });

    setAchievements(updatedAchievements);
    await AsyncStorage.setItem('heroAchievements', JSON.stringify(updatedAchievements));
  };
  
  const getHeroTitle = () => {
    if (userLevel <= 5) return "Aprendiz";
    if (userLevel <= 10) return "Aventurero";
    if (userLevel <= 20) return "Veterano";
    if (userLevel <= 50) return "Maestro";
    return "Leyenda";
  };

  const getHeroIcon = () => {
    if (userLevel <= 5) return "🛡️";
    if (userLevel <= 10) return "⚔️";
    if (userLevel <= 20) return "🏆";
    if (userLevel <= 50) return "👑";
    return "🌟";
  };

  const getCompletedAchievementsCount = () => {
    return achievements.filter(ach => ach.completed).length;
  };

  const expToNextLevel = userLevel * 100;
  const expProgress = (userExp / expToNextLevel) * 100;

  const quickActions = [
    {
      id: 1,
      title: 'Mascotas',
      icon: 'paw',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('Mascotas')
    },
    {
      id: 2,
      title: 'Misiones',
      icon: 'list',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('Missions')
    },
    {
      id: 3,
      title: 'Inventario',
      icon: 'bag',
      color: '#45B7D1',
      onPress: () => console.log('Inventario')
    },
    {
      id: 4,
      title: 'Tienda',
      icon: 'storefront',
      color: '#F7DC6F',
       onPress: () => navigation.navigate('Shop')
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sección de Perfil y Avatar */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={changeAvatar}>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: scaleValue }] }]}>
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{userLevel}</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            {editingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                />
                <TouchableOpacity onPress={saveHeroName} style={styles.saveButton}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setEditingName(true); setTempName(userName); }}>
                <View style={styles.nameDisplayContainer}>
                  <Text style={styles.username}>{userName}</Text>
                  <Ionicons name="pencil" size={16} color="#FFD700" style={{ marginLeft: 5 }} />
                </View>
              </TouchableOpacity>
            )}
            <Text style={styles.heroTitle}>{getHeroIcon()} {getHeroTitle()}</Text>
          </View>
        </View>

        {/* Barra de experiencia */}
        <View style={styles.expContainer}>
          <View style={styles.expHeader}>
            <Text style={styles.expLabel}>Experiencia</Text>
            <Text style={styles.expText}>{userExp}/{expToNextLevel} EXP</Text>
          </View>
          <View style={styles.expBarContainer}>
            <View style={[styles.expBar, { width: `${expProgress}%` }]} />
          </View>
        </View>
      </View>

      {/* Sección de Estadísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Estadísticas de Aventura</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Misiones Completadas</Text>
            <Text style={styles.statValue}>{stats.missionsCompleted}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Días Activos</Text>
            <Text style={styles.statValue}>{stats.daysActive}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mascotas Adoptadas</Text>
            <Text style={styles.statValue}>{stats.petsAdopted}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Logros Desbloqueados</Text>
            <Text style={styles.statValue}>{getCompletedAchievementsCount()}/{achievements.length}</Text>
          </View>
        </View>
      </View>

      {/* Sección de Logros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏅 Logros</Text>
        <View style={styles.achievementsList}>
          {achievements.map((ach) => (
            <View key={ach.id} style={[styles.achievementItem, ach.completed && styles.achievementCompleted]}>
              <View>
                <Text style={styles.achievementTitle}>{ach.title}</Text>
                <Text style={styles.achievementDescription}>{ach.description}</Text>
              </View>
              {ach.completed && <Ionicons name="checkmark-circle" size={24} color="#FFD700" style={styles.trophyIcon} />}
            </View>
          ))}
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon} size={28} color="#fff" />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Motivación diaria */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💪 Motivación</Text>
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            "Cada misión completada te acerca más a convertirte en una leyenda. ¡Sigue adelante, héroe!"
          </Text>
          <Text style={styles.motivationAuthor}>- El Oráculo</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  profileSection: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0F23',
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 14,
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameInput: {
    backgroundColor: '#2D2D44',
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    padding: 5,
  },
  heroTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '600',
  },
  expContainer: {
    // Ya está dentro de la sección de perfil
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  expText: {
    color: '#4ECDC4',
    fontSize: 14,
  },
  expBarContainer: {
    height: 8,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    overflow: 'hidden',
  },
  expBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  achievementsList: {
    // Estilos para la lista de logros
  },
  achievementItem: {
    backgroundColor: '#1A1A2E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#455A64',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementCompleted: {
    borderLeftColor: '#FFD700',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  trophyIcon: {
    marginLeft: 'auto',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 55) / 2,
    aspectRatio: 1.5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  actionText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  motivationCard: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F7DC6F',
  },
  motivationText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  motivationAuthor: {
    color: '#F7DC6F',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
  },
});