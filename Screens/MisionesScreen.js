import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmojiPicker from 'rn-emoji-keyboard';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MisionesScreen() {
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [missionText, setMissionText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [missionToComplete, setMissionToComplete] = useState(null);

  useEffect(() => {
    const loadMissions = async () => {
      const savedMissions = await AsyncStorage.getItem('missions');
      const savedCompleted = await AsyncStorage.getItem('completedMissions');
      if (savedMissions) setMissions(JSON.parse(savedMissions));
      if (savedCompleted) setCompletedMissions(JSON.parse(savedCompleted));
    };
    loadMissions();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('missions', JSON.stringify(missions));
    AsyncStorage.setItem('completedMissions', JSON.stringify(completedMissions));
  }, [missions, completedMissions]);

  const addMission = () => {
    if (missionText.trim() === '') return;
    const newMission = {
      id: Date.now().toString(),
      text: missionText,
      emoji: selectedEmoji,
      time: selectedTime ? selectedTime.toLocaleTimeString() : null,
      completed: false,
    };
    setMissions([...missions, newMission]);
    setMissionText('');
    setSelectedTime(null);
  };

  const requestCompleteMission = (mission) => {
    setMissionToComplete(mission);
    setModalVisible(true);
  };

  const handleCompleteMission = (saveToAchievements) => {
    if (missionToComplete) {
      setMissions(missions.filter((m) => m.id !== missionToComplete.id));
      if (saveToAchievements) {
        setCompletedMissions([...completedMissions, missionToComplete]);
      }
    }
    setModalVisible(false);
    setMissionToComplete(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ Misiones</Text>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
          <Text style={styles.emoji}>{selectedEmoji}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nueva misión..."
          placeholderTextColor="#aaa"
          value={missionText}
          onChangeText={setMissionText}
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.timeBtn}>⏰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={addMission}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {selectedTime && <Text style={styles.timeText}>⏰ {selectedTime.toLocaleTimeString()}</Text>}

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mission}>
            <Text style={styles.missionText}>
              {item.emoji} {item.text} {item.time ? `⏰ ${item.time}` : ''}
            </Text>
            <TouchableOpacity onPress={() => requestCompleteMission(item)}>
              <Text style={styles.completeBtn}>✔</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.title}>🏆 Logros</Text>
      <FlatList
        data={completedMissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.completedText}>
            ✅ {item.emoji} {item.text} {item.time ? `⏰ ${item.time}` : ''}
          </Text>
        )}
      />

      {/* Emoji Picker */}
      <EmojiPicker
        onEmojiSelected={(emoji) => {
          setSelectedEmoji(emoji.emoji);
          setShowEmojiPicker(false);
        }}
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
      />

      {/* Time Picker */}
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

      {/* Modal para decidir */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Qué quieres hacer con la misión?</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: 'green' }]}
              onPress={() => handleCompleteMission(true)}
            >
              <Text style={styles.modalBtnText}>🏆 Guardar en Logros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: 'red' }]}
              onPress={() => handleCompleteMission(false)}
            >
              <Text style={styles.modalBtnText}>🗑 Descartar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 10, marginHorizontal: 5 },
  emoji: { fontSize: 28 },
  addBtn: { backgroundColor: '#4caf50', padding: 10, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 20 },
  timeBtn: { fontSize: 22, color: '#fff', marginHorizontal: 5 },
  timeText: { color: '#aaa', marginBottom: 10 },
  mission: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#1e1e1e', borderRadius: 10, marginVertical: 5 },
  missionText: { color: '#fff' },
  completeBtn: { color: '#4caf50', fontSize: 22 },
  completedText: { color: '#aaa', textDecorationLine: 'line-through', marginVertical: 2 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 15, width: '80%', alignItems: 'center' },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 20 },
  modalBtn: { padding: 12, borderRadius: 10, marginVertical: 5, width: '100%' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
