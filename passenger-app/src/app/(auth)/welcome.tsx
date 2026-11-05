import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050e26" />

      {/* Top Branding Section with Official Logo */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.tagline}>Your Ride, Simplified.</Text>
      </View>

      {/* Feature Value Propositions in Dark Midnight Navy */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(0, 150, 240, 0.15)', borderColor: 'rgba(0, 150, 240, 0.3)' }]}>
            <Ionicons name="flash-outline" size={22} color="#38bdf8" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Instant Booking</Text>
            <Text style={styles.featureSubtitle}>
              Connect with nearby verified drivers in seconds
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#60a5fa" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Safe & Transparent</Text>
            <Text style={styles.featureSubtitle}>
              Know your exact fare upfront with zero hidden charges
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.3)' }]}>
            <Ionicons name="navigate-outline" size={22} color="#38bdf8" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Live GPS Tracking</Text>
            <Text style={styles.featureSubtitle}>
              Watch your driver arrive in real-time on the map
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050e26', // Signature deep dark navy
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 36,
  },
  logoContainer: {
    width: '100%',
    maxWidth: 290,
    height: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 16,
    color: '#38bdf8',
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  featuresContainer: {
    marginVertical: 16,
    gap: 20,
    backgroundColor: '#0b1a3d',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  actionSection: {
    marginBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#0096f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#0096f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});
