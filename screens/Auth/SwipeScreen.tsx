import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import Swiper from 'react-native-deck-swiper';
import BottomNav from '@/components/BottomNav';

const data = [
  {
    id: '1',
    name: 'Paulo',
    age: 29,
    profession: 'Químico Farmacéutico',
    university: 'Universidad América',
    imageUrls: [
      'https://i.pinimg.com/736x/6b/c7/a5/6bc7a54267e9f28f3e19075e283eba3b.jpg',
      'https://i.pinimg.com/736x/6b/c7/a5/6bc7a54267e9f28f3e19075e283eba3b.jpg',
    ],
  },
  {
    id: '2',
    name: 'Ana',
    age: 26,
    profession: 'Ingeniera Industrial',
    university: 'Universidad Nacional',
    imageUrls: [
      'https://i.pinimg.com/736x/6b/c7/a5/6bc7a54267e9f28f3e19075e283eba3b.jpg',
      'https://i.pinimg.com/736x/6b/c7/a5/6bc7a54267e9f28f3e19075e283eba3b.jpg',
    ],
  },
];

export default function SwipeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedAllCards, setSwipedAllCards] = useState(false);
  const router = useRouter();

  const onSwiped = (index: number) => {
    if (index === data.length - 1) {
      setSwipedAllCards(true);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dx > 50) {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (gestureState.dx < -50) {
        setCurrentIndex((prev) => Math.min(prev + 1, data[0].imageUrls.length - 1));
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/logo-liggo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <Swiper
        cards={data}
        renderCard={(card) => (
          <View style={styles.card}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
              {card.imageUrls.map((imageUrl, index) => (
                <Image key={index} source={{ uri: imageUrl }} style={styles.image} />
              ))}
            </ScrollView>
            <Text style={styles.name}>{card.name}</Text>
            <Text>{card.age} años</Text>
            <Text>{card.profession} en {card.university}</Text>
          </View>
        )}
        onSwiped={onSwiped}
        onSwipedAll={() => setSwipedAllCards(true)}
        cardIndex={0}
        backgroundColor={'#f5f5f5'}
        stackSize={3}
      />

      {swipedAllCards && (
        <View style={styles.endMessage}>
          <Text style={styles.endText}>¡No hay más perfiles!</Text>
        </View>
      )}

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 100, // espacio para el logo
    paddingBottom: 90, // espacio para el BottomNav
    alignItems: 'center',
  },
  
  logoContainer: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    paddingBottom: 90
  },
  logo: {
    width: 180,
    height: 80,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    margin: 10,
    width: '90%',
    paddingBottom: 10,
    
  },
  imageCarousel: {
    width: '100%',
    height: 500,
  },
  image: {
    width: 350,
    height: 500,
    borderRadius: 10,
    marginRight: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  endMessage: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    width: '100%',
  },
  endText: {
    fontSize: 18,
    color: '#777',
  },
});
