import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginLanding() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#f5b2dd', '#68f173']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
    
      {/* Logo */}
      <Image source={require('@/assets/logo-liggo.png')} style={styles.logo} resizeMode="contain" />

      {/* Texto de bienvenida */}
      <Text style={styles.subtitle}>
        Inicia sesión y si no tienes una puedes crearla con el correo institucional
      </Text>

      {/* Botones principales */}
      <TouchableOpacity style={styles.buttonOutline} onPress={() => router.push('/auth/login')}>
        <Text style={styles.buttonText}>Inicio de sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonOutline} onPress={() => router.push('/auth/register')}>
        <Text style={styles.buttonText}>Crear cuenta</Text>
      </TouchableOpacity>

        {/* Texto inferior 
      <TouchableOpacity onPress={() => router.push('/auth/forgot')}>
        <Text style={styles.forgotText}>¿Te olvidaste tu contraseña?</Text>
      </TouchableOpacity>*/}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 30,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  buttonOutline: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  forgotText: {
    marginTop: 30,
    color: '#fff',
    fontSize: 13,
  },
});
