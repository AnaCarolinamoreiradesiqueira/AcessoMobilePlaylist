import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';

const API_URL = 'https://webapptech.site/apiplaylist/api/playlist';

const HomeScreen = ({ navigation }) => {
  const [musicas, setMusicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nm_musica: '', artista: '', gravadora: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMusicas();
  }, []);

  const fetchMusicas = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMusicas(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as músicas.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { nm_musica, artista, gravadora } = form;
    if (!nm_musica || !artista || !gravadora) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          Alert.alert('Sucesso', 'Música atualizada!');
          setEditingId(null);
          setForm({ nm_musica: '', artista: '', gravadora: '' });
          fetchMusicas();
        } else {
          Alert.alert('Erro', 'Falha ao atualizar música.');
        }
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          Alert.alert('Sucesso', 'Música adicionada!');
          setForm({ nm_musica: '', artista: '', gravadora: '' });
          fetchMusicas();
        } else {
          Alert.alert('Erro', 'Falha ao adicionar música.');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro na comunicação com a API.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nm_musica: item.nm_musica,
      artista: item.artista,
      gravadora: item.gravadora,
    });
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmar', 'Deseja realmente excluir esta música?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
              Alert.alert('Sucesso', 'Música excluída.');
              fetchMusicas();
            } else {
              Alert.alert('Erro', 'Falha ao excluir música.');
            }
          } catch {
            Alert.alert('Erro', 'Erro na comunicação com a API.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.nm_musica}</Text>
        <Text style={styles.subtitle}>Artista: {item.artista}</Text>
        <Text style={styles.subtitle}>Gravadora: {item.gravadora}</Text>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => handleEdit(item)}>
        <Text style={styles.btnText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => handleDelete(item.id)}>
        <Text style={styles.btnText}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
     
      <TouchableOpacity
        style={styles.btnPerfil}
        onPress={() => navigation.navigate('Perfil')}
      >
        <Text style={styles.btnPerfilText}>Perfil</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Playlist</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Nome da música"
          style={styles.input}
          value={form.nm_musica}
          onChangeText={text => handleChange('nm_musica', text)}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Artista"
          style={styles.input}
          value={form.artista}
          onChangeText={text => handleChange('artista', text)}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Gravadora"
          style={styles.input}
          value={form.gravadora}
          onChangeText={text => handleChange('gravadora', text)}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
          <Text style={styles.btnText}>{editingId ? 'Atualizar' : 'Adicionar'}</Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            style={[styles.btnSubmit, styles.btnCancel]}
            onPress={() => {
              setEditingId(null);
              setForm({ nm_musica: '', artista: '', gravadora: '' });
            }}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1db954" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={musicas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          style={{ width: '100%', marginTop: 20 }}
          ListEmptyComponent={<Text style={{ color: '#999', textAlign: 'center' }}>Nenhuma música encontrada.</Text>}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  btnPerfil: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#1db954',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  btnPerfilText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1db954',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  btnSubmit: {
    backgroundColor: '#1db954',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnCancel: {
    backgroundColor: '#555',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  subtitle: {
    color: '#bbb',
    fontSize: 14,
    marginTop: 3,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
  },
  btnEdit: {
    backgroundColor: '#3b82f6',
  },
  btnDelete: {
    backgroundColor: '#ef4444',
  },
});

export default HomeScreen;
