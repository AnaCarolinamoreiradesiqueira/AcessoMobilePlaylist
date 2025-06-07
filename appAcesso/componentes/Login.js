import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './Firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigation.replace('Home');
    } catch (err) {
      setLoading(false);
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Informe seu email para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Email de recuperação enviado. Verifique sua caixa de entrada.');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível enviar o email de recuperação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 AMGG PLAYLIST 🎵</Text>

      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.link}>Criar uma conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePasswordReset}>
        <Text style={[styles.link, { marginTop: 10 }]}>Esqueci minha senha</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    paddingHorizontal: 20 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1DB954',
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E03E3E',
  },
  error: {
    color: '#E03E3E',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1DB954',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  link: {
    color: '#1DB954',
    marginTop: 20,
    fontWeight: '600',
  },
});

export default LoginScreen;
