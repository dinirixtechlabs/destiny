import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';

interface RideDetail {
  id: string;
  pickup_address: string;
  destination_address: string;
  final_fare?: number;
  estimated_fare: number;
  status: string;
  driver?: {
    id: string;
    full_name: string;
    license_number: string;
    rating: number;
    active_vehicle?: {
      vehicle_number: string;
      model: string;
      color: string;
      vehicle_type: string;
    };
  } | null;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Poor — Needs improvement',
  2: 'Fair — Below expectations',
  3: 'Good — Standard service',
  4: 'Very Good — Great experience',
  5: 'Excellent — Outstanding ride!',
};

const COMPLIMENT_CHIPS = [
  'Smooth & Safe Ride',
  'Polite & Friendly Driver',
  'Clean & Sanitized Vehicle',
  'On Time Pickup',
  'Good Navigation',
  'Comfortable Seating',
];

export default function RateRideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await api.get(`/rides/${id}/`);
        if (res.data?.success && res.data?.data) {
          setRide(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load ride for rating:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);

    // Combine chips and review
    const finalReviewParts = [];
    if (selectedChips.length > 0) {
      finalReviewParts.push(`[${selectedChips.join(', ')}]`);
    }
    if (review.trim()) {
      finalReviewParts.push(review.trim());
    }
    const combinedReview = finalReviewParts.join(' ');

    try {
      const res = await api.post('/ratings/', {
        ride_id: id,
        rating,
        review: combinedReview,
      });

      if (res.data?.success) {
        setSubmitted(true);
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to submit rating.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      if (msg.includes('already been rated')) {
        setSubmitted(true);
      } else {
        Alert.alert('Rating Notice', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#050e26" />
        <ActivityIndicator size="large" color="#0096f0" />
        <Text style={styles.loadingText}>Loading trip details...</Text>
      </SafeAreaView>
    );
  }

  // Success celebration state
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#050e26" />
        <View style={styles.successContent}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={48} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successSubtitle}>
            Your rating helps Destiny ensure the highest standard of electric mobility and driver excellence.
          </Text>

          <View style={styles.submittedRatingCard}>
            <View style={styles.submittedStarsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= rating ? 'star' : 'star-outline'}
                  size={24}
                  color="#fbbf24"
                />
              ))}
            </View>
            <Text style={styles.submittedRatingLabel}>{STAR_LABELS[rating]}</Text>
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071439" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Trip</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Driver Summary Card */}
        <View style={styles.driverSummaryCard}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={32} color="#38bdf8" />
          </View>
          <Text style={styles.driverName}>
            {ride?.driver?.full_name || 'Destiny Driver'}
          </Text>
          <Text style={styles.vehicleSubtitle}>
            {ride?.driver?.active_vehicle
              ? `${ride.driver.active_vehicle.model} • ${ride.driver.active_vehicle.vehicle_number}`
              : 'Destiny Electric Vehicle'}
          </Text>
          <View style={styles.fareTag}>
            <Text style={styles.fareLabel}>Trip Fare:</Text>
            <Text style={styles.fareValue}>
              ₹{ride?.final_fare || ride?.estimated_fare || 0}
            </Text>
          </View>
        </View>

        {/* Star Rating Selector */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingSectionTitle}>HOW WOULD YOU RATE THIS RIDE?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starTouch}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={42}
                  color={star <= rating ? '#fbbf24' : '#64748b'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.starDescriptor}>{STAR_LABELS[rating]}</Text>
        </View>

        {/* Compliment Chips */}
        <View style={styles.complimentsCard}>
          <Text style={styles.chipsSectionTitle}>WHAT WENT WELL?</Text>
          <View style={styles.chipsWrap}>
            {COMPLIMENT_CHIPS.map((chip) => {
              const active = selectedChips.includes(chip);
              return (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleChip(chip)}
                  activeOpacity={0.7}
                >
                  {active && (
                    <Ionicons name="checkmark-circle" size={14} color="#38bdf8" style={{ marginRight: 4 }} />
                  )}
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Review Comments Box */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>ADDITIONAL COMMENTS (OPTIONAL)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share feedback or tips for your driver..."
            placeholderTextColor="#64748b"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <Text style={styles.charCount}>{review.length} / 300</Text>
        </View>

        {/* Submit Rating Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050e26',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#050e26',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 14,
    backgroundColor: '#071439',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0b1a3d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  driverSummaryCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  driverAvatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 150, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 150, 240, 0.45)',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  vehicleSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  fareTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#071330',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  fareLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
  },
  ratingCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  starTouch: {
    padding: 4,
  },
  starDescriptor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38bdf8',
    marginTop: 4,
  },
  complimentsCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071330',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActive: {
    borderColor: '#0096f0',
    backgroundColor: 'rgba(0, 150, 240, 0.15)',
  },
  chipText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  reviewCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#071330',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 90,
  },
  charCount: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: '#0096f0',
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  successContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 150, 240, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 150, 240, 0.35)',
    marginBottom: 20,
  },
  successIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0096f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096f0',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 24,
  },
  submittedRatingCard: {
    backgroundColor: '#0b1a3d',
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 28,
    width: '100%',
    maxWidth: 300,
  },
  submittedStarsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  submittedRatingLabel: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#0096f0',
    height: 52,
    paddingHorizontal: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096f0',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

