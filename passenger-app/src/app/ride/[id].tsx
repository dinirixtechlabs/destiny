import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axios';
import BookingMap from '../../components/BookingMap';

interface VehicleInfo {
  vehicle_number: string;
  model: string;
  color: string;
  vehicle_type: string;
}

interface DriverInfo {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  rating: number;
  active_vehicle?: VehicleInfo;
}

interface RideDetail {
  id: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address: string;
  destination_latitude: number;
  destination_longitude: number;
  estimated_fare: number;
  final_fare?: number;
  status:
    | 'REQUESTED'
    | 'SEARCHING_DRIVER'
    | 'ACCEPTED'
    | 'DRIVER_ARRIVING'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  driver?: DriverInfo | null;
  cancellation_reason?: string;
  requested_at: string;
}

const STATUS_PROGRESSION = [
  { key: 'SEARCHING_DRIVER', label: 'Searching', icon: 'search' },
  { key: 'ACCEPTED', label: 'Accepted', icon: 'checkmark-circle' },
  { key: 'DRIVER_ARRIVING', label: 'Arriving', icon: 'navigate' },
  { key: 'ARRIVED', label: 'Arrived', icon: 'pin' },
  { key: 'IN_PROGRESS', label: 'On Trip', icon: 'speedometer' },
  { key: 'COMPLETED', label: 'Completed', icon: 'flag' },
];

const CANCEL_REASONS = [
  'Changed my mind',
  'Driver is taking too long',
  'Found alternative transport',
  'Incorrect pickup address',
  'Emergency',
];

export default function RideTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);

  // Rating State (Step 3.6 integration)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const fetchRideDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/rides/${id}/`);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setRide(data);

        // Prompt rating modal if completed and not yet rated
        if (data.status === 'COMPLETED' && !ratingSubmitted) {
          setShowRatingModal(true);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching ride status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for status updates every 3.5 seconds
  useEffect(() => {
    fetchRideDetails();
    const interval = setInterval(fetchRideDetails, 3500);
    return () => clearInterval(interval);
  }, [id, ratingSubmitted]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleConfirmCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      const res = await api.post(`/rides/${id}/cancel/`, {
        reason: selectedReason,
      });
      if (res.data?.success) {
        setShowCancelModal(false);
        Alert.alert('Ride Cancelled', 'Your ride request has been cancelled.');
        fetchRideDetails();
      }
    } catch (err: any) {
      Alert.alert('Cancellation Error', err.response?.data?.message || 'Failed to cancel ride.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!id) return;
    setSubmittingRating(true);
    try {
      const res = await api.post('/ratings/', {
        ride_id: id,
        rating: ratingScore,
        review: reviewText.trim(),
      });
      if (res.data?.success) {
        setRatingSubmitted(true);
        setShowRatingModal(false);
        Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      Alert.alert('Notice', msg);
      setShowRatingModal(false);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCallDriver = () => {
    if (ride?.driver?.phone) {
      const phoneUrl = `tel:${ride.driver.phone}`;
      Linking.canOpenURL(phoneUrl).then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Call Driver', `Phone Number: ${ride.driver?.phone}`);
        }
      });
    } else {
      Alert.alert('Driver Info', 'No phone number available for this driver.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SEARCHING_DRIVER':
      case 'REQUESTED':
        return '#38bdf8'; // Sky blue
      case 'ACCEPTED':
      case 'DRIVER_ARRIVING':
        return '#0096f0'; // Electric neon blue
      case 'ARRIVED':
      case 'IN_PROGRESS':
        return '#10b981'; // Emerald
      case 'COMPLETED':
        return '#34d399'; // Mint green
      case 'CANCELLED':
        return '#f87171'; // Red
      default:
        return '#94a3b8';
    }
  };

  const getCurrentStepIndex = () => {
    if (!ride) return 0;
    const idx = STATUS_PROGRESSION.findIndex((s) => s.key === ride.status);
    return idx >= 0 ? idx : 0;
  };

  // Can cancel before driver arrives (SEARCHING_DRIVER, ACCEPTED, DRIVER_ARRIVING)
  const canCancel =
    ride &&
    ['REQUESTED', 'SEARCHING_DRIVER', 'ACCEPTED', 'DRIVER_ARRIVING'].includes(ride.status);

  if (loading && !ride) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#050e26" />
        <ActivityIndicator size="large" color="#0096f0" />
        <Text style={styles.loadingText}>Connecting to Destiny Ride Radar...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071439" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Trip Tracker</Text>
          <Text style={styles.headerSubtitle}>Destiny Trip ID: #{ride?.id?.slice(0, 8)}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchRideDetails}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={18} color="#38bdf8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Dark Map Preview */}
        {ride && (
          <View style={styles.mapCard}>
            <BookingMap
              currentLocation={{
                latitude: ride.pickup_latitude,
                longitude: ride.pickup_longitude,
              }}
              destinationCoords={{
                latitude: ride.destination_latitude,
                longitude: ride.destination_longitude,
              }}
              pickupAddress={ride.pickup_address}
              destinationAddress={ride.destination_address}
            />
          </View>
        )}

        {/* Live Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(ride?.status || '')}22` },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: getStatusColor(ride?.status || '') }]}
              />
              <Text
                style={[styles.statusBadgeText, { color: getStatusColor(ride?.status || '') }]}
              >
                {ride?.status.replace('_', ' ')}
              </Text>
            </View>
            <View style={styles.fareTag}>
              <Text style={styles.fareCurrency}>₹</Text>
              <Text style={styles.fareAmount}>
                {ride?.final_fare || ride?.estimated_fare || 0}
              </Text>
            </View>
          </View>

          {/* Contextual Status Subtitle */}
          <Text style={styles.statusMainText}>
            {ride?.status === 'SEARCHING_DRIVER' && 'Finding the nearest verified Destiny driver...'}
            {ride?.status === 'ACCEPTED' && 'Driver found! Assigning vehicle and routing...'}
            {ride?.status === 'DRIVER_ARRIVING' && 'Your driver is en route to your pickup point.'}
            {ride?.status === 'ARRIVED' && 'Your driver is waiting at the pickup location!'}
            {ride?.status === 'IN_PROGRESS' && 'Trip underway. Relax and enjoy your electric ride!'}
            {ride?.status === 'COMPLETED' && 'Trip completed. Thank you for riding with Destiny!'}
            {ride?.status === 'CANCELLED' && `Trip cancelled: ${ride.cancellation_reason || 'Cancelled'}`}
          </Text>

          {/* Stepper Status Progression */}
          {ride?.status !== 'CANCELLED' && (
            <View style={styles.stepperContainer}>
              {STATUS_PROGRESSION.map((step, idx) => {
                const currentIdx = getCurrentStepIndex();
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isPassed && styles.stepCircleActive,
                        isCurrent && styles.stepCircleCurrent,
                      ]}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={12}
                        color={isPassed ? '#ffffff' : '#64748b'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isPassed && styles.stepLabelActive,
                        isCurrent && styles.stepLabelCurrent,
                      ]}
                      numberOfLines={1}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Assigned Driver Details Card */}
        {ride?.driver ? (
          <View style={styles.driverCard}>
            <View style={styles.driverCardHeader}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={24} color="#38bdf8" />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{ride.driver.full_name}</Text>
                <View style={styles.driverRatingRow}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.driverRating}>
                    {Number(ride.driver.rating).toFixed(1)}
                  </Text>
                  <Text style={styles.driverLicense}>• {ride.driver.license_number}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDriver}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Vehicle Details */}
            {ride.driver.active_vehicle && (
              <View style={styles.vehicleDetailsRow}>
                <View style={styles.vehicleIconCircle}>
                  <Ionicons name="bicycle" size={18} color="#38bdf8" />
                </View>
                <View style={styles.vehicleTextWrap}>
                  <Text style={styles.vehiclePlate}>
                    {ride.driver.active_vehicle.vehicle_number}
                  </Text>
                  <Text style={styles.vehicleSpecs}>
                    {ride.driver.active_vehicle.model} • {ride.driver.active_vehicle.color} (
                    {ride.driver.active_vehicle.vehicle_type})
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          ride?.status === 'SEARCHING_DRIVER' && (
            <View style={styles.searchingRadarCard}>
              <ActivityIndicator color="#38bdf8" size="small" />
              <View style={{ flex: 1 }}>
                <Text style={styles.radarTitle}>Connecting to Drivers</Text>
                <Text style={styles.radarSubtitle}>
                  Broadcasting your pickup request to nearby online drivers
                </Text>
              </View>
            </View>
          )
        )}

        {/* Trip Route Card */}
        <View style={styles.routeCard}>
          <Text style={styles.routeSectionTitle}>TRIP DETAILS</Text>
          <View style={styles.routeRow}>
            <View style={styles.pickupDot} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeType}>PICKUP</Text>
              <Text style={styles.routeAddress}>{ride?.pickup_address}</Text>
            </View>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeRow}>
            <View style={styles.destDot} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeType}>DESTINATION</Text>
              <Text style={styles.routeAddress}>{ride?.destination_address}</Text>
            </View>
          </View>
        </View>

        {/* Cancel Ride Option (Allowed before driver arrives) */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCancelModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={18} color="#f87171" style={{ marginRight: 6 }} />
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}

        {/* Rate Trip Button if Completed */}
        {ride?.status === 'COMPLETED' && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => router.push({ pathname: '/ride/rate', params: { id } })}
            activeOpacity={0.85}
          >
            <Ionicons name="star" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.rateButtonText}>
              {ratingSubmitted ? 'View / Update Trip Rating' : 'Rate Your Ride'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Return Home Button */}
        {['COMPLETED', 'CANCELLED'].includes(ride?.status || '') && (
          <TouchableOpacity
            style={styles.homeReturnButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.homeReturnText}>Back to Home</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Cancel Reason Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Ride Request?</Text>
            <Text style={styles.modalSubtitle}>
              Please select a reason for cancelling this trip:
            </Text>

            <View style={styles.reasonsList}>
              {CANCEL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      selectedReason === reason && styles.radioCircleSelected,
                    ]}
                  >
                    {selectedReason === reason && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Keep Ride</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmCancel}
                disabled={cancelling}
                activeOpacity={0.8}
              >
                {cancelling ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal (Step 3.6 ready) */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>How was your ride?</Text>
            <Text style={styles.modalSubtitle}>
              Rate your trip with {ride?.driver?.full_name || 'your Destiny driver'}
            </Text>

            {/* Star Selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatingScore(star)}
                  style={styles.starTouch}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= ratingScore ? 'star' : 'star-outline'}
                    size={36}
                    color="#fbbf24"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Review Input */}
            <TextInput
              style={styles.reviewInput}
              placeholder="Leave a comment (optional)..."
              placeholderTextColor="#64748b"
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRatingModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitRating}
                disabled={submittingRating}
                activeOpacity={0.85}
              >
                {submittingRating ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Rating</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0b1a3d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  mapCard: {
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#071439',
  },
  statusCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fareTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fareCurrency: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '700',
    marginRight: 2,
  },
  fareAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38bdf8',
  },
  statusMainText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    lineHeight: 20,
    marginVertical: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#071330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#0096f0',
    borderColor: '#38bdf8',
  },
  stepCircleCurrent: {
    borderColor: '#38bdf8',
    borderWidth: 2,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  stepLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#94a3b8',
  },
  stepLabelCurrent: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  driverCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  driverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 150, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 150, 240, 0.4)',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  driverRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  driverRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fbbf24',
  },
  driverLicense: {
    fontSize: 12,
    color: '#64748b',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0096f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096f0',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  vehicleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071330',
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  vehicleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 240, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleTextWrap: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  vehicleSpecs: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  searchingRadarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 150, 240, 0.08)',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 240, 0.25)',
    gap: 12,
  },
  radarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38bdf8',
  },
  radarSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  routeCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  routeSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38bdf8',
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  routeConnector: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeType: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    height: 52,
    borderRadius: 16,
    marginTop: 4,
  },
  cancelButtonText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '700',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0096f0',
    height: 52,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: '#0096f0',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  rateButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  homeReturnButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  homeReturnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0b1a3d',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  reasonsList: {
    gap: 8,
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071330',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  reasonItemSelected: {
    borderColor: '#0096f0',
    backgroundColor: 'rgba(0, 150, 240, 0.12)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#38bdf8',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  reasonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 14,
  },
  starTouch: {
    padding: 4,
  },
  reviewInput: {
    backgroundColor: '#071330',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0096f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
