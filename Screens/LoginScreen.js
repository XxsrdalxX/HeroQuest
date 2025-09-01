import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animación de aparición
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Por favor, ingresa tu email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const data = await AsyncStorage.getItem('user');
      if (!data) {
        Alert.alert('Error', 'No hay un usuario registrado con este correo.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(data);
      if (user.email === email && user.password === password) {
        Alert.alert('¡Bienvenido, Héroe!', 'Has iniciado sesión con éxito.');
        navigation.replace('Home');
      } else {
        Alert.alert('Credenciales incorrectas', 'El email o la contraseña son incorrectos.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1511210137703-9975b6d51025?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} // Fondo épico
      style={styles.background}
    >
      <View style={styles.overlay} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Entrar al Reino 👑</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#FFD700" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico del Héroe"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#FFD700" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña Secreta"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Iniciando Sesión...</Text>
            ) : (
              <Text style={styles.buttonText}>Entrar al Castillo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={styles.link}>
              ¿Aún no tienes cuenta? <Text style={styles.linkBold}>Forja tu destino</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#3a3a5a',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 14,
  },
  linkBold: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
});