import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmojiPicker from 'rn-emoji-keyboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MisionesScreen() {
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [missionText, setMissionText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⚔️');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Novato');
  const [selectedReward, setSelectedReward] = useState(10);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const [leveledUpTo, setLeveledUpTo] = useState(0);
  const [missionToComplete, setMissionToComplete] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [levelUpAnim] = useState(new Animated.Value(0));

  const difficulties = [
    { name: 'Novato', color: '#4CAF50', reward: 10, icon: '🛡️' },
    { name: 'Aventurero', color: '#2196F3', reward: 25, icon: '⚔️' },
    { name: 'Veterano', color: '#FF9800', reward: 50, icon: '🏆' },
    { name: 'Legendario', color: '#9C27B0', reward: 100, icon: '👑' },
    { name: 'Mítico', color: '#F44336', reward: 200, icon: '🌟' }
  ];

  const epicEmojis = ['⚔️', '🛡️', '🏰', '🐉', '👑', '🗡️', '🏹', '🧙‍♂️', '⚡', '🔥', '💎', '📜', '🏆', '⭐'];

  useEffect(() => {
    const loadMissions = async () => {
      const savedMissions = await AsyncStorage.getItem('epicMissions');
      const savedCompleted = await AsyncStorage.getItem('epicCompletedMissions');
      if (savedMissions) setMissions(JSON.parse(savedMissions));
      if (savedCompleted) setCompletedMissions(JSON.parse(savedCompleted));
    };
    loadMissions();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('epicMissions', JSON.stringify(missions));
    AsyncStorage.setItem('epicCompletedMissions', JSON.stringify(completedMissions));
  }, [missions, completedMissions]);
  
  // ¡NUEVO! Efecto para la animación del modal de subida de nivel
  useEffect(() => {
    if (levelUpModalVisible) {
      Animated.timing(levelUpAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [levelUpModalVisible]);

  const getDifficultyData = (diffName) => {
    return difficulties.find(d => d.name === diffName) || difficulties[0];
  };

  const addMission = async () => {
    if (missionText.trim() === '') {
        Alert.alert('Error', 'La misión no puede estar vacía.');
        return;
    }

    const diffData = getDifficultyData(selectedDifficulty);
    const newMission = {
      id: Date.now().toString(),
      text: missionText,
      emoji: selectedEmoji,
      difficulty: selectedDifficulty,
      reward: diffData.reward,
      time: selectedTime ? selectedTime.toLocaleTimeString() : null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setMissions([...missions, newMission]);
    setMissionText('');
    setSelectedTime(null);
    setShowCreateForm(false);

    const totalMissions = (await AsyncStorage.getItem('totalMissions') || '0');
    const newTotal = parseInt(totalMissions) + 1;
    await AsyncStorage.setItem('totalMissions', newTotal.toString());

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const requestCompleteMission = (mission) => {
    setMissionToComplete(mission);
    setModalVisible(true);
  };

  const handleCompleteMission = async (saveToLegends) => {
    if (missionToComplete) {
      setMissions(missions.filter((m) => m.id !== missionToComplete.id));

      if (saveToLegends) {
        const completedMission = {
          ...missionToComplete,
          completedAt: new Date().toISOString()
        };
        setCompletedMissions([...completedMissions, completedMission]);

        let currentExp = parseInt(await AsyncStorage.getItem('userExp')) || 0;
        let currentLevel = parseInt(await AsyncStorage.getItem('userLevel')) || 1;
        
        currentExp += missionToComplete.reward;

        const expNeeded = currentLevel * 100;

        if (currentExp >= expNeeded) {
          const oldLevel = currentLevel;
          currentLevel += 1;
          currentExp -= expNeeded;

          setLeveledUpTo(currentLevel);
          setLevelUpModalVisible(true);
        }
        
        await AsyncStorage.setItem('userExp', currentExp.toString());
        await AsyncStorage.setItem('userLevel', currentLevel.toString());
        
        let heroStats = JSON.parse(await AsyncStorage.getItem('heroStats')) || {};
        heroStats.missionsCompleted = (heroStats.missionsCompleted || 0) + 1;
        heroStats.totalExp = currentExp;
        
        await AsyncStorage.setItem('heroStats', JSON.stringify(heroStats));
      } else {
        Alert.alert('Misión Descartada', 'La gesta ha sido olvidada y no obtendrás recompensa.');
      }
    }
    setModalVisible(false);
    setMissionToComplete(null);
  };

  const closeLevelUpModal = () => {
    setLevelUpModalVisible(false);
    levelUpAnim.setValue(0); // Reinicia la animación para la próxima vez
  };

  const getMissionTypeText = (difficulty) => {
    const types = {
      'Novato': 'Tarea del Escudero',
      'Aventurero': 'Misión del Caballero',
      'Veterano': 'Empresa del Paladín',
      'Legendario': 'Gesta Heroica',
      'Mítico': 'Leyenda Épica'
    };
    return types[difficulty] || 'Misión';
  };

  const renderMission = ({ item }) => {
    const diffData = getDifficultyData(item.difficulty);
    
    return (
      <View style={[styles.missionCard, { borderLeftColor: diffData.color }]}>
        <View style={styles.missionHeader}>
          <View style={styles.missionTitle}>
            <Text style={styles.missionEmoji}>{item.emoji}</Text>
            <View style={styles.missionInfo}>
              <Text style={styles.missionText}>{item.text}</Text>
              <Text style={styles.missionType}>
                {diffData.icon} {getMissionTypeText(item.difficulty)}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.completeBtn, { backgroundColor: diffData.color }]}
            onPress={() => requestCompleteMission(item)}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.missionFooter}>
          <View style={styles.rewardContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rewardText}>{item.reward} EXP</Text>
          </View>
          {item.time && (
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={16} color="#4ECDC4" />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderCompletedMission = ({ item }) => {
    const diffData = getDifficultyData(item.difficulty);
    
    return (
      <View style={[styles.completedCard, { borderLeftColor: diffData.color }]}>
        <View style={styles.completedHeader}>
          <Text style={styles.completedEmoji}>{item.emoji}</Text>
          <View style={styles.completedInfo}>
            <Text style={styles.completedText}>{item.text}</Text>
            <Text style={styles.completedType}>
              ✅ {getMissionTypeText(item.difficulty)} Completada
            </Text>
          </View>
          <View style={styles.completedReward}>
            <Text style={styles.completedExpText}>+{item.reward}</Text>
            <Text style={styles.expLabel}>EXP</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>⚔️ PERGAMINO DE MISIONES ⚔️</Text>
          <Text style={styles.subtitle}>~ Crónicas del Reino ~</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Ionicons name={showCreateForm ? "close" : "add"} size={24} color="#fff" />
          <Text style={styles.createButtonText}>
            {showCreateForm ? "Cerrar Pergamino" : "Nueva Gesta"}
          </Text>
        </TouchableOpacity>

        {showCreateForm && (
          <Animated.View style={[styles.createForm, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.formTitle}>📜 Escribir Nueva Gesta</Text>
            
            <View style={styles.emojiSelector}>
              <Text style={styles.formLabel}>Símbolo de la Misión:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                {epicEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiButton,
                      selectedEmoji === emoji && styles.selectedEmoji
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.formLabel}>Descripción de la Gesta:</Text>
              <TextInput
                style={styles.input}
                placeholder="Describe tu misión épica..."
                placeholderTextColor="#666"
                value={missionText}
                onChangeText={setMissionText}
                multiline
              />
            </View>

            <View style={styles.difficultyContainer}>
              <Text style={styles.formLabel}>Rango de Dificultad:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {difficulties.map((diff, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.difficultyButton,
                      { borderColor: diff.color },
                      selectedDifficulty === diff.name && { backgroundColor: diff.color + '20' }
                    ]}
                    onPress={() => {
                      setSelectedDifficulty(diff.name);
                      setSelectedReward(diff.reward);
                    }}
                  >
                    <Text style={styles.difficultyIcon}>{diff.icon}</Text>
                    <Text style={styles.difficultyName}>{diff.name}</Text>
                    <Text style={styles.difficultyReward}>{diff.reward} EXP</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.timeSelector} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="time" size={20} color="#4ECDC4" />
              <Text style={styles.timeText}>
                {selectedTime ? `Hora: ${selectedTime.toLocaleTimeString()}` : "Asignar Hora (Opcional)"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={addMission}>
              <Text style={styles.addButtonText}>🏆 ACEPTAR MISIÓN</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚔️ MISIONES ACTIVAS ({missions.length})</Text>
          {missions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>🏰</Text>
              <Text style={styles.emptyLabel}>El reino está en paz...</Text>
              <Text style={styles.emptySubtext}>Crea una nueva gesta para comenzar tu aventura</Text>
            </View>
          ) : (
            <FlatList
              data={missions}
              keyExtractor={(item) => item.id}
              renderItem={renderMission}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 LEYENDAS COMPLETADAS ({completedMissions.length})</Text>
          {completedMissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>📜</Text>
              <Text style={styles.emptyLabel}>Aún no hay leyendas escritas</Text>
            </View>
          ) : (
            <FlatList
              data={completedMissions.slice(-5)}
              keyExtractor={(item) => item.id}
              renderItem={renderCompletedMission}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <EmojiPicker
        onEmojiSelected={(emoji) => {
          setSelectedEmoji(emoji.emoji);
          setShowEmojiPicker(false);
        }}
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedTime(date);
          }}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>⚔️ GESTA COMPLETADA ⚔️</Text>
            <Text style={styles.modalSubtitle}>
              ¿Qué deseas hacer con esta hazaña?
            </Text>
            
            <TouchableOpacity
              style={[styles.modalBtn, styles.legendBtn]}
              onPress={() => handleCompleteMission(true)}
            >
              <Text style={styles.modalBtnText}>🏆 GRABAR EN LAS LEYENDAS</Text>
              <Text style={styles.modalBtnSubtext}>
                Ganar {missionToComplete?.reward || 0} EXP y honor eterno
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalBtn, styles.discardBtn]}
              onPress={() => handleCompleteMission(false)}
            >
              <Text style={styles.modalBtnText}>🗑️ DESECHAR EN EL OLVIDO</Text>
              <Text style={styles.modalBtnSubtext}>Sin recompensas, solo el vacío</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={levelUpModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.levelUpModal, { transform: [{ scale: levelUpAnim }] }]}>
            <Text style={styles.levelUpTitle}>✨ ¡FELICIDADES, HÉROE! ✨</Text>
            <Text style={styles.levelUpText}>
              ¡Has subido al nivel
            </Text>
            <Text style={styles.newLevelText}>{leveledUpTo}</Text>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={closeLevelUpModal}
            >
              <Text style={styles.closeModalText}>Continuar Aventura</Text>
            </TouchableOpacity>
          </Animated.View>
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
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  createForm: {
    backgroundColor: '#1A1A2E',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  formTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  emojiSelector: {
    marginBottom: 20,
  },
  emojiScroll: {
    flexDirection: 'row',
  },
  emojiButton: {
    backgroundColor: '#2D2D44',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedEmoji: {
    backgroundColor: '#FFD700',
  },
  emojiText: {
    fontSize: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2D2D44',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    marginBottom: 20,
  },
  difficultyButton: {
    backgroundColor: '#2D2D44',
    borderWidth: 2,
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  difficultyIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  difficultyName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyReward: {
    color: '#FFD700',
    fontSize: 10,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  timeText: {
    color: '#4ECDC4',
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  missionCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  missionTitle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  missionEmoji: {
    fontSize: 28,
    marginRight: 15,
  },
  missionInfo: {
    flex: 1,
  },
  missionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  missionType: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
  },
  completeBtn: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    color: '#FFD700',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCard: {
    backgroundColor: '#0F1419',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    opacity: 0.8,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 24,
    marginRight: 15,
    opacity: 0.7,
  },
  completedInfo: {
    flex: 1,
  },
  completedText: {
    color: '#aaa',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  completedType: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 2,
  },
  completedReward: {
    alignItems: 'center',
  },
  completedExpText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expLabel: {
    color: '#FFD700',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyLabel: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContainer: {
    backgroundColor: '#1A1A2E',
    padding: 30,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtn: {
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  legendBtn: {
    backgroundColor: '#4CAF50',
  },
  discardBtn: {
    backgroundColor: '#F44336',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnSubtext: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  levelUpModal: {
    backgroundColor: '#1A1A2E',
    padding: 40,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 15,
  },
  levelUpTitle: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  levelUpText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  newLevelText: {
    color: '#4ECDC4',
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeModalBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});