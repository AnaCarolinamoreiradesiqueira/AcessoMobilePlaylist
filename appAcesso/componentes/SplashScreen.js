import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 4000);

    return () => clearTimeout(timer); 
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Image source={{ uri: 'https://www.theaudiostore.in/cdn/shop/articles/Creating_the_Perfect_Playlist-_Tips_and_Tricks_for_Audiophiles.png?v=1674203789&width=1000' }} style={styles.splashImage} />
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  splashImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
