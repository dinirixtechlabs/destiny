import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface BookingMapProps {
  currentLocation: LocationCoords;
  destinationCoords: LocationCoords | null;
  pickupAddress: string;
  destinationAddress: string;
  onRecenter?: () => void;
}

// Custom dark luxury map styling for Google Maps (Android/iOS)
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#071439' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#071439' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0a2342' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#13285c' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1b3a7a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0096f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0284c7' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#0e2340' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#030b1e' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

let NativeMapView: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default;
    NativeMarker = Maps.Marker;
    NativePolyline = Maps.Polyline;
  } catch (e) {
    console.warn('Native maps could not be loaded:', e);
  }
}

export default function BookingMap({
  currentLocation,
  destinationCoords,
  pickupAddress,
  destinationAddress,
  onRecenter,
}: BookingMapProps) {
  // 1. Native Platform (Android / iOS): Use react-native-maps with Google Maps provider
  if (Platform.OS !== 'web' && NativeMapView) {
    const region = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: destinationCoords ? 0.08 : 0.03,
      longitudeDelta: destinationCoords ? 0.08 : 0.03,
    };

    return (
      <View style={styles.mapContainer}>
        <NativeMapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          region={region}
          customMapStyle={DARK_MAP_STYLE}
          showsUserLocation={false}
          showsCompass={false}
          showsTraffic={true}
        >
          {/* Pickup Marker */}
          <NativeMarker
            coordinate={currentLocation}
            title="Pickup Location"
            description={pickupAddress}
          >
            <View style={styles.pickupPinOuter}>
              <View style={styles.pickupPinInner} />
            </View>
          </NativeMarker>

          {/* Destination Marker */}
          {destinationCoords && (
            <NativeMarker
              coordinate={destinationCoords}
              title="Destination"
              description={destinationAddress}
            >
              <View style={styles.destPinOuter}>
                <Ionicons name="flag" size={14} color="#ffffff" />
              </View>
            </NativeMarker>
          )}

          {/* Route Line */}
          {destinationCoords && NativePolyline && (
            <NativePolyline
              coordinates={[currentLocation, destinationCoords]}
              strokeColor="#0096f0"
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}
        </NativeMapView>

        {/* Recenter Button */}
        {onRecenter && (
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={onRecenter}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={22} color="#38bdf8" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 2. Web Platform: Real Live Google Maps Integration
  const googleMapsUrl = destinationCoords
    ? `https://maps.google.com/maps?saddr=${currentLocation.latitude},${currentLocation.longitude}&daddr=${destinationCoords.latitude},${destinationCoords.longitude}&t=m&z=13&output=embed`
    : `https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&t=m&z=15&output=embed`;

  const openInGoogleMaps = () => {
    const fullUrl = destinationCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`;
    Linking.openURL(fullUrl).catch(() => {});
  };

  return (
    <View style={styles.webMapContainer}>
      {/* Live Google Map iframe on Web */}
      {Platform.OS === 'web' &&
        React.createElement('iframe', {
          src: googleMapsUrl,
          style: {
            width: '100%',
            height: '100%',
            border: 0,
            borderRadius: 22,
            filter: 'contrast(1.05) brightness(0.95)',
          },
          loading: 'lazy',
          allowFullScreen: false,
          referrerPolicy: 'no-referrer-when-downgrade',
        })}

      {/* Floating Google Maps Brand Badge */}
      <TouchableOpacity
        style={styles.googleMapsBadge}
        onPress={openInGoogleMaps}
        activeOpacity={0.8}
      >
        <Ionicons name="map" size={14} color="#38bdf8" />
        <Text style={styles.googleMapsBadgeText}>Google Maps Live</Text>
        <Ionicons name="open-outline" size={12} color="#94a3b8" />
      </TouchableOpacity>

      {/* Floating Live Coords Pill */}
      <View style={styles.coordsPill}>
        <View style={styles.gpsDot} />
        <Text style={styles.coordsPillText}>
          {destinationCoords
            ? `${currentLocation.latitude.toFixed(3)}, ${currentLocation.longitude.toFixed(3)} → ${destinationCoords.latitude.toFixed(3)}, ${destinationCoords.longitude.toFixed(3)}`
            : `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#071439',
  },
  pickupPinOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 150, 240, 0.3)',
    borderWidth: 2,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38bdf8',
  },
  destPinOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0b1a3d',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  webMapContainer: {
    flex: 1,
    backgroundColor: '#071439',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 22,
  },
  googleMapsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 20, 57, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    gap: 6,
    zIndex: 10,
  },
  googleMapsBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  coordsPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 20, 57, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
    zIndex: 10,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  coordsPillText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
