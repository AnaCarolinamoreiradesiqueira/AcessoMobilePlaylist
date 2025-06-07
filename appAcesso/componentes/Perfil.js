import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from './Firebase';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const PerfilScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setName(data.name || '');
          setBio(data.bio || '');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, { name, bio });
        setUserData({ ...userData, name, bio });
        setIsEditing(false);
        Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  };

  const pickImageAndUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
      });
      
      if (!result.canceled) {
        const base64Img = `data:image/jpg;base64,${result.assets[0].base64}`;
        const data = {
          file: base64Img,
          upload_preset: 'preset_publico',
          cloud_name: 'dqzebwdjf',
        };
        
        const res = await fetch('https://api.cloudinary.com/v1_1/dqzebwdjf/image/upload', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'content-type': 'application/json' },
        });
        
        const json = await res.json();
  
        if (json.secure_url) {
          const user = auth.currentUser;
          await updateDoc(doc(db, 'users', user.uid), { photo: json.secure_url });
          setUserData(prev => ({ ...prev, photo: json.secure_url }));
          Alert.alert('Sucesso', 'Foto de perfil atualizada!');
        } else {
          Alert.alert('Erro', 'Erro ao enviar imagem. Verifique o preset.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Algo deu errado ao tentar fazer o upload.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1db954" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.textWhite}>Usuário não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil do Usuário</Text>

      {userData.photo ? (
        <Image source={{ uri: userData.photo }} style={styles.profileImage} />
      ) : (
        <View style={[styles.profileImage, styles.placeholder]}>
          <Text style={styles.placeholderText}>Sem Foto</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btnUpload} onPress={pickImageAndUpload}>
        <Text style={styles.btnText}>Editar Foto de Perfil</Text>
      </TouchableOpacity>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome"
            placeholderTextColor="#777"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Bio"
            placeholderTextColor="#777"
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
              <Text style={styles.btnText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsEditing(false)}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.textWhite}><Text style={styles.bold}>Nome:</Text> {userData.name || 'Não definido'}</Text>
          <Text style={styles.textWhite}><Text style={styles.bold}>Bio:</Text> {userData.bio || 'Não definida'}</Text>

          <TouchableOpacity style={styles.btn} onPress={() => setIsEditing(true)}>
            <Text style={styles.btnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#1db954',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 15,
    backgroundColor: '#333',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#777',
    fontSize: 16,
  },
  btnUpload: {
    backgroundColor: '#1db954',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 25,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#222',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textWhite: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    backgroundColor: '#1db954',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  btnSave: {
    flex: 1,
    marginRight: 10,
  },
  btnCancel: {
    backgroundColor: '#555',
    flex: 1,
    marginLeft: 10,
  },
});

export default PerfilScreen;
