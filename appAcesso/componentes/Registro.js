import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, Image 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from './Firebase'; // ajuste o caminho conforme seu arquivo

const RegistroScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para imagem
  const [photo, setPhoto] = useState(null);        // URI para mostrar preview
  const [photoBase64, setPhotoBase64] = useState(null);  // base64 para upload

  // Função para abrir galeria e pegar imagem + base64
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        setPhotoBase64(result.assets[0].base64);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
      console.log(error);
    }
  };

  // Função para enviar imagem para Cloudinary e pegar URL
  const uploadImageToCloudinary = async (base64) => {
    try {
      const base64Img = `data:image/jpg;base64,${base64}`;
      const data = {
        file: base64Img,
        upload_preset: 'preset_publico', // Troque pelo seu upload_preset válido
        cloud_name: 'dqzebwdjf',         // Troque pelo seu cloud_name válido
      };

      const res = await fetch('https://api.cloudinary.com/v1_1/dqzebwdjf/image/upload', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' },
      });

      const json = await res.json();

      if (json.secure_url) {
        return json.secure_url;
      } else {
        Alert.alert('Erro', 'Erro ao enviar imagem. Verifique se o preset está correto.');
        return null;
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar a imagem.');
      console.log(error);
      return null;
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let photo = null;

      if (photoBase64) {
        photo = await uploadImageToCloudinary(photoBase64);
        console.log(photo);
        if (!photo) {
          setLoading(false);
          
          return;
        }
      }

  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      
      await setDoc(doc(db, 'users', user.uid), {
        name,
        bio,
        photo: photo || null,
      });

      setLoading(false);
      Alert.alert('Sucesso! 🎉', 'Usuário cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);
    } catch (err) {
      setLoading(false);
      setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>

        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>Selecionar Foto de Perfil</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Nome *"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Bio"
          placeholderTextColor="#aaa"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Email *"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Senha *"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Já tem uma conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </>
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
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  photoPlaceholder: {
    color: '#aaa',
    fontSize: 14,
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
    alignSelf: 'flex-start',
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

export default RegistroScreen;
