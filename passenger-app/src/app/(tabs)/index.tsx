import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import BookingMap, { LocationCoords } from '../../components/BookingMap';

interface FareEstimateData {
  distance_km: number;
  estimated_duration_minutes: number;
  estimated_fare: number;
}

interface LocationSuggestion {
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

interface DestinationPreset {
  title: string;
  subtitle: string;
  coords: LocationCoords;
}

const PRESET_DESTINATIONS: DestinationPreset[] = [
  {
    title: 'Chandrabhaga Sea Beach',
    subtitle: 'Marine Drive, Konark, Puri, Odisha',
    coords: { latitude: 19.865395, longitude: 86.112345 },
  },
  {
    title: 'Konark Sun Temple',
    subtitle: 'UNESCO Heritage Site, Konark, Odisha',
    coords: { latitude: 19.887600, longitude: 86.094500 },
  },
  {
    title: 'Puri Sri Jagannath Temple',
    subtitle: 'Grand Road (Bada Danda), Puri',
    coords: { latitude: 19.804900, longitude: 85.817900 },
  },
  {
    title: 'Indiranagar 100ft Road',
    subtitle: 'Metro & Shopping Hub, Bengaluru',
    coords: { latitude: 12.978400, longitude: 77.640800 },
  },
  {
    title: 'Biju Patnaik Airport (BBI)',
    subtitle: 'Terminal 1 & 2, Bhubaneswar, Odisha',
    coords: { latitude: 20.252500, longitude: 85.817800 },
  },
];

const DEFAULT_COORDS: LocationCoords = {
  latitude: 19.8876,
  longitude: 86.0945, // Default centered on Konark
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [pickupCoords, setPickupCoords] = useState<LocationCoords>(DEFAULT_COORDS);
  const [pickupAddress, setPickupAddress] = useState('Konark Sun Temple, Odisha');
  const [destinationCoords, setDestinationCoords] = useState<LocationCoords | null>(null);
  const [destinationAddress, setDestinationAddress] = useState('');

  // Autocomplete state for Pickup and Destination
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'dest' | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  const [vehicleType, setVehicleType] = useState<'SCOOTER' | 'CAB'>('SCOOTER');
  const [fareEstimate, setFareEstimate] = useState<FareEstimateData | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Initialize GPS Location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = {
            latitude: Number(loc.coords.latitude.toFixed(6)),
            longitude: Number(loc.coords.longitude.toFixed(6)),
          };
          setPickupCoords(coords);

          if (Platform.OS !== 'web') {
            try {
              const geocoded = await Location.reverseGeocodeAsync(coords);
              if (geocoded && geocoded.length > 0) {
                const item = geocoded[0];
                const parts = [item.name || item.street, item.subregion || item.city, item.region].filter(Boolean);
                setPickupAddress(parts.join(', ') || 'Current GPS Location');
              } else {
                setPickupAddress(`Current GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
              }
            } catch {
              setPickupAddress(`Current GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
            }
          } else {
            setPickupAddress(`Current GPS (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
          }
        }
      } catch (err) {
        console.warn('Location detection failed:', err);
      }
    })();
  }, []);

  // Location Autocomplete Search
  const searchLocations = (query: string, field: 'pickup' | 'dest') => {
    setActiveSearchField(field);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setIsSearchingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/locations/autocomplete/?q=${encodeURIComponent(query.trim())}`);
        if (res.data?.success && res.data?.data) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        console.warn('Autocomplete search failed:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 180);
  };

  // Select Suggestion
  const handleSelectSuggestion = (item: LocationSuggestion) => {
    const coords: LocationCoords = {
      latitude: Number(item.latitude.toFixed(6)),
      longitude: Number(item.longitude.toFixed(6)),
    };
    const address = `${item.title}, ${item.subtitle}`;

    if (activeSearchField === 'pickup') {
      setPickupAddress(address);
      setPickupCoords(coords);
      if (destinationCoords) {
        fetchFareEstimate(destinationCoords, coords);
      }
    } else {
      setDestinationAddress(address);
      setDestinationCoords(coords);
      fetchFareEstimate(coords, pickupCoords);
    }

    setActiveSearchField(null);
    setSuggestions([]);
  };

  // Fetch Fare Estimate
  const fetchFareEstimate = async (destCoords: LocationCoords, originCoords = pickupCoords) => {
    setIsEstimating(true);
    setBookingError(null);
    try {
      const res = await api.post('/fares/estimate/', {
        pickup_latitude: Number(originCoords.latitude.toFixed(6)),
        pickup_longitude: Number(originCoords.longitude.toFixed(6)),
        destination_latitude: Number(destCoords.latitude.toFixed(6)),
        destination_longitude: Number(destCoords.longitude.toFixed(6)),
      });

      if (res.data?.success && res.data?.data) {
        setFareEstimate(res.data.data);
      }
    } catch (err: any) {
      console.warn('Fare estimate API failed:', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSelectPreset = (preset: DestinationPreset) => {
    setDestinationAddress(preset.title);
    setDestinationCoords(preset.coords);
    setActiveSearchField(null);
    setSuggestions([]);
    fetchFareEstimate(preset.coords);
  };

  const handleClearDestination = () => {
    setDestinationAddress('');
    setDestinationCoords(null);
    setFareEstimate(null);
    setActiveSearchField(null);
    setSuggestions([]);
  };

  const handleBookRide = async () => {
    if (!destinationCoords || !destinationAddress.trim()) {
      Alert.alert('Destination Required', 'Please select or enter your drop-off destination.');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const payload = {
        pickup_address: pickupAddress || 'Current GPS Location',
        pickup_latitude: Number(pickupCoords.latitude.toFixed(6)),
        pickup_longitude: Number(pickupCoords.longitude.toFixed(6)),
        destination_address: destinationAddress.trim(),
        destination_latitude: Number(destinationCoords.latitude.toFixed(6)),
        destination_longitude: Number(destinationCoords.longitude.toFixed(6)),
      };

      const res = await api.post('/rides/', payload);

      if (res.data?.success && res.data?.data?.ride_id) {
        const rideId = res.data.data.ride_id;
        handleClearDestination();
        router.push({
          pathname: '/ride/[id]',
          params: { id: rideId },
        });
      } else {
        setBookingError(res.data?.message || 'Failed to create ride request.');
      }
    } catch (err: any) {
      console.error('Ride booking failed:', err);
      let msg = 'Failed to book ride. Please check network and try again.';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errs = err.response.data.errors;
        const key = Object.keys(errs)[0];
        if (key) msg = `${key}: ${errs[key][0]}`;
      }
      setBookingError(msg);
      Alert.alert('Booking Error', msg);
    } finally {
      setIsBooking(false);
    }
  };

  const calculateFinalFare = () => {
    if (!fareEstimate) return 0;
    return vehicleType === 'SCOOTER'
      ? fareEstimate.estimated_fare
      : Math.round(fareEstimate.estimated_fare * 1.8);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071439" />

      {/* Top Floating App Bar with Official Destiny Logo */}
      <View style={styles.topHeader}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <View style={styles.userBadge}>
          <Ionicons name="person-circle-outline" size={16} color="#38bdf8" />
          <Text style={styles.userGreeting}>
            {user?.full_name?.split(' ')[0] || 'Passenger'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Real Google Map Preview */}
          <View style={styles.mapCard}>
            <BookingMap
              currentLocation={pickupCoords}
              destinationCoords={destinationCoords}
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
            />
          </View>

          {/* Booking & Search Form */}
          <View style={styles.bookingCard}>
            {/* Pickup Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>PICKUP LOCATION</Text>
              <View style={[styles.inputRow, activeSearchField === 'pickup' && styles.inputRowFocused]}>
                <View style={styles.pickupDot} />
                <TextInput
                  style={styles.textInput}
                  value={pickupAddress}
                  onChangeText={(text) => {
                    setPickupAddress(text);
                    searchLocations(text, 'pickup');
                  }}
                  onFocus={() => {
                    searchLocations(pickupAddress, 'pickup');
                  }}
                  placeholder="Enter pickup location (e.g. Konark Sun Temple)"
                  placeholderTextColor="#64748b"
                />
                {activeSearchField === 'pickup' && (
                  <TouchableOpacity onPress={() => setActiveSearchField(null)} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Pickup Autocomplete Dropdown */}
              {activeSearchField === 'pickup' && suggestions.length > 0 && (
                <View style={styles.dropdownContainer}>
                  {isSearchingSuggestions && (
                    <View style={styles.searchingRow}>
                      <ActivityIndicator size="small" color="#38bdf8" />
                      <Text style={styles.searchingText}>Searching places...</Text>
                    </View>
                  )}
                  {suggestions.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dropdownIconWrap}>
                        <Ionicons name="location-outline" size={16} color="#38bdf8" />
                      </View>
                      <View style={styles.dropdownTextWrap}>
                        <Text style={styles.dropdownTitle}>{item.title}</Text>
                        <Text style={styles.dropdownSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Connecting visual divider */}
            <View style={styles.routeConnectorLine} />

            {/* Destination Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>DESTINATION</Text>
              <View
                style={[
                  styles.inputRow,
                  destinationAddress ? styles.inputRowActive : null,
                  activeSearchField === 'dest' && styles.inputRowFocused,
                ]}
              >
                <View style={styles.destDot} />
                <TextInput
                  style={styles.textInput}
                  value={destinationAddress}
                  onChangeText={(text) => {
                    setDestinationAddress(text);
                    if (!text) {
                      handleClearDestination();
                    } else {
                      searchLocations(text, 'dest');
                    }
                  }}
                  onFocus={() => {
                    searchLocations(destinationAddress, 'dest');
                  }}
                  placeholder="Search destination (type 'ch' for Chandrabhaga...)"
                  placeholderTextColor="#64748b"
                />
                {destinationAddress.length > 0 && (
                  <TouchableOpacity onPress={handleClearDestination} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Destination Autocomplete Dropdown */}
              {activeSearchField === 'dest' && suggestions.length > 0 && (
                <View style={styles.dropdownContainer}>
                  {isSearchingSuggestions && (
                    <View style={styles.searchingRow}>
                      <ActivityIndicator size="small" color="#38bdf8" />
                      <Text style={styles.searchingText}>Searching locations...</Text>
                    </View>
                  )}
                  {suggestions.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dropdownIconWrap}>
                        <Ionicons name="navigate-outline" size={16} color="#10b981" />
                      </View>
                      <View style={styles.dropdownTextWrap}>
                        <Text style={styles.dropdownTitle}>{item.title}</Text>
                        <Text style={styles.dropdownSubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Error Banner */}
            {bookingError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#f87171" />
                <Text style={styles.errorText}>{bookingError}</Text>
              </View>
            )}

            {/* Quick Destination Suggestions */}
            {!destinationCoords && activeSearchField !== 'dest' && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsHeader}>Popular Destinations in Odisha & Hubs</Text>
                {PRESET_DESTINATIONS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetItem}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.presetIcon}>
                      <Ionicons name="location-outline" size={18} color="#38bdf8" />
                    </View>
                    <View style={styles.presetDetails}>
                      <Text style={styles.presetTitle}>{preset.title}</Text>
                      <Text style={styles.presetSubtitle}>{preset.subtitle}</Text>
                    </View>
                    <Ionicons name="arrow-forward-outline" size={16} color="#64748b" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Fare Estimate & Vehicle Selection Card */}
            {destinationCoords && (
              <View style={styles.estimateSection}>
                {isEstimating ? (
                  <View style={styles.calculatingBox}>
                    <ActivityIndicator color="#38bdf8" size="small" />
                    <Text style={styles.calculatingText}>Calculating route & upfront fare...</Text>
                  </View>
                ) : fareEstimate ? (
                  <>
                    <View style={styles.routeStatsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="speedometer-outline" size={16} color="#38bdf8" />
                        <Text style={styles.statLabel}>Distance</Text>
                        <Text style={styles.statValue}>{fareEstimate.distance_km} km</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={16} color="#34d399" />
                        <Text style={styles.statLabel}>Est. Time</Text>
                        <Text style={styles.statValue}>{fareEstimate.estimated_duration_minutes} mins</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Ionicons name="flash-outline" size={16} color="#fbbf24" />
                        <Text style={styles.statLabel}>Traffic</Text>
                        <Text style={styles.statValue}>Optimal</Text>
                      </View>
                    </View>

                    {/* Vehicle Selection Chips */}
                    <Text style={styles.vehicleSelectTitle}>Select Ride Option</Text>
                    <View style={styles.vehicleOptions}>
                      {/* Electric Scooter */}
                      <TouchableOpacity
                        style={[
                          styles.vehicleOptionCard,
                          vehicleType === 'SCOOTER' && styles.vehicleOptionSelected,
                        ]}
                        onPress={() => setVehicleType('SCOOTER')}
                        activeOpacity={0.8}
                      >
                        <View style={styles.vehicleIconCircle}>
                          <Ionicons name="bicycle" size={22} color="#38bdf8" />
                        </View>
                        <View style={styles.vehicleInfo}>
                          <View style={styles.vehicleNameRow}>
                            <Text style={styles.vehicleName}>Destiny Scooter</Text>
                            <View style={styles.ecoBadge}>
                              <Text style={styles.ecoBadgeText}>ECO</Text>
                            </View>
                          </View>
                          <Text style={styles.vehicleEta}>1–3 min away • 1 seat</Text>
                        </View>
                        <Text style={styles.vehiclePrice}>₹{fareEstimate.estimated_fare.toFixed(0)}</Text>
                      </TouchableOpacity>

                      {/* City Cab */}
                      <TouchableOpacity
                        style={[
                          styles.vehicleOptionCard,
                          vehicleType === 'CAB' && styles.vehicleOptionSelected,
                        ]}
                        onPress={() => setVehicleType('CAB')}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.vehicleIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                          <Ionicons name="car" size={22} color="#818cf8" />
                        </View>
                        <View style={styles.vehicleInfo}>
                          <Text style={styles.vehicleName}>Destiny Cab</Text>
                          <Text style={styles.vehicleEta}>3–5 min away • 4 seats</Text>
                        </View>
                        <Text style={styles.vehiclePrice}>₹{(fareEstimate.estimated_fare * 1.8).toFixed(0)}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Book Button */}
                    <TouchableOpacity
                      style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
                      onPress={handleBookRide}
                      disabled={isBooking}
                      activeOpacity={0.85}
                    >
                      {isBooking ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <View style={styles.bookButtonContent}>
                          <Text style={styles.bookButtonText}>
                            Book {vehicleType === 'SCOOTER' ? 'Scooter' : 'Cab'} • ₹{calculateFinalFare()}
                          </Text>
                          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            )}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050e26',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 14,
    backgroundColor: '#071439',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandLogo: {
    width: 120,
    height: 34,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 150, 240, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 240, 0.3)',
    gap: 6,
  },
  userGreeting: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  mapCard: {
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#071439',
  },
  bookingCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  inputGroup: {
    gap: 6,
    position: 'relative',
    zIndex: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071330',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  inputRowActive: {
    borderColor: '#0096f0',
  },
  inputRowFocused: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(7, 19, 48, 0.95)',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38bdf8',
    marginRight: 12,
  },
  destDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  routeConnectorLine: {
    width: 2,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 18,
    marginVertical: 4,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  dropdownContainer: {
    backgroundColor: '#071330',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  searchingText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  dropdownIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownTextWrap: {
    flex: 1,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  dropdownSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1,
  },
  suggestionsContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  presetIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 150, 240, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  presetDetails: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  presetSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  estimateSection: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
    gap: 14,
  },
  calculatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  calculatingText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  routeStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071330',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  vehicleSelectTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleOptions: {
    gap: 10,
  },
  vehicleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071330',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  vehicleOptionSelected: {
    borderColor: '#0096f0',
    backgroundColor: 'rgba(0, 150, 240, 0.12)',
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 150, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  ecoBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  ecoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34d399',
  },
  vehicleEta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38bdf8',
  },
  bookButton: {
    backgroundColor: '#0096f0',
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#0096f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  bookButtonDisabled: {
    opacity: 0.65,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
