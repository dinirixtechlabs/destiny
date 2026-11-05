import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../api/axios';

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

interface RideItem {
  id: string;
  pickup_address: string;
  destination_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
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

type FilterType = 'ALL' | 'COMPLETED' | 'ACTIVE' | 'CANCELLED';

export default function ActivityScreen() {
  const router = useRouter();

  const [rides, setRides] = useState<RideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('ALL');

  const fetchRides = async () => {
    try {
      const res = await api.get('/rides/my-rides/');
      if (res.data?.success && res.data?.data) {
        setRides(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load ride history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRides();
  }, []);

  const filteredRides = rides.filter((r) => {
    if (filter === 'COMPLETED') return r.status === 'COMPLETED';
    if (filter === 'CANCELLED') return r.status === 'CANCELLED';
    if (filter === 'ACTIVE') {
      return !['COMPLETED', 'CANCELLED'].includes(r.status);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#34d399'; // Mint Green
      case 'CANCELLED':
        return '#f87171'; // Red
      case 'IN_PROGRESS':
      case 'ARRIVED':
      case 'DRIVER_ARRIVING':
      case 'ACCEPTED':
        return '#0096f0'; // Electric Blue
      case 'SEARCHING_DRIVER':
      case 'REQUESTED':
        return '#38bdf8'; // Sky Cyan
      default:
        return '#94a3b8';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRideCard = ({ item }: { item: RideItem }) => {
    const isActive = !['COMPLETED', 'CANCELLED'].includes(item.status);
    const fare = item.final_fare || item.estimated_fare || 0;
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.rideCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" style={{ marginRight: 6 }} />
            <Text style={styles.dateText}>{formatDate(item.requested_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Route Details */}
        <View style={styles.routeContainer}>
          <View style={styles.routeRow}>
            <View style={styles.pickupPin} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.pickup_address}
            </Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <View style={styles.destPin} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.destination_address}
            </Text>
          </View>
        </View>

        {/* Driver & Fare Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.driverInfoWrap}>
            {item.driver ? (
              <>
                <View style={styles.driverAvatarSmall}>
                  <Ionicons name="person" size={14} color="#38bdf8" />
                </View>
                <View>
                  <Text style={styles.driverNameSmall} numberOfLines={1}>
                    {item.driver.full_name}
                  </Text>
                  <Text style={styles.vehicleInfoSmall}>
                    {item.driver.active_vehicle
                      ? `${item.driver.active_vehicle.vehicle_number} • ${item.driver.active_vehicle.model}`
                      : 'Electric Vehicle'}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noDriverWrap}>
                <Ionicons name="radar-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
                <Text style={styles.noDriverText}>
                  {item.status === 'SEARCHING_DRIVER' ? 'Matching Driver...' : 'No Driver Assigned'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.fareWrap}>
            <Text style={styles.fareCurrency}>₹</Text>
            <Text style={styles.fareAmount}>{fare}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.cardActions}>
          {isActive ? (
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => router.push({ pathname: '/ride/[id]', params: { id: item.id } })}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnPrimaryText}>Track Active Trip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => router.push({ pathname: '/ride/[id]', params: { id: item.id } })}
                activeOpacity={0.7}
              >
                <Text style={styles.actionBtnSecondaryText}>View Route</Text>
              </TouchableOpacity>

              {item.status === 'COMPLETED' && (
                <TouchableOpacity
                  style={styles.actionBtnRate}
                  onPress={() => router.push({ pathname: '/ride/rate', params: { id: item.id } })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="star" size={14} color="#fbbf24" style={{ marginRight: 4 }} />
                  <Text style={styles.actionBtnRateText}>Rate Trip</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071439" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Activity</Text>
          <Text style={styles.subtitle}>
            {rides.length} Total Trip{rides.length === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={styles.techBadge}>
          <Ionicons name="leaf-outline" size={14} color="#34d399" style={{ marginRight: 4 }} />
          <Text style={styles.techBadgeText}>Zero Emissions</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['ALL', 'COMPLETED', 'ACTIVE', 'CANCELLED'] as FilterType[]).map((tab) => {
          const isSelected = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, isSelected && styles.filterTabSelected]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, isSelected && styles.filterTabTextSelected]}>
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#0096f0" size="large" />
          <Text style={styles.loadingText}>Fetching your trip activity...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRides}
          keyExtractor={(item) => item.id}
          renderItem={renderRideCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38bdf8"
              colors={['#0096f0']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="time-outline" size={44} color="#38bdf8" />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === 'ALL'
                  ? 'No trip activity found'
                  : `No ${filter.toLowerCase()} trips`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'ALL'
                  ? 'Your completed rides, fare receipts, and driver ratings will appear here.'
                  : `You have no rides currently filed under ${filter.toLowerCase()}.`}
              </Text>
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => router.push('/(tabs)')}
                activeOpacity={0.85}
              >
                <Text style={styles.bookNowBtnText}>Book a Destiny Ride</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050e26',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 16,
    backgroundColor: '#071439',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  techBadgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#071439',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#071330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterTabSelected: {
    backgroundColor: '#0096f0',
    borderColor: '#38bdf8',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterTabTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  rideCard: {
    backgroundColor: '#0b1a3d',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  routeContainer: {
    backgroundColor: '#071330',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickupPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
  },
  destPin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  routeDivider: {
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginLeft: 3,
    marginVertical: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  driverInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 150, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  driverNameSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  vehicleInfoSmall: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  noDriverWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noDriverText: {
    fontSize: 12,
    color: '#64748b',
  },
  fareWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fareCurrency: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '700',
    marginRight: 2,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#38bdf8',
  },
  cardActions: {
    marginTop: 12,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0096f0',
    height: 42,
    borderRadius: 12,
    shadowColor: '#0096f0',
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBtnSecondaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnRate: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  actionBtnRateText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 150, 240, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 150, 240, 0.3)',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: 24,
  },
  bookNowBtn: {
    backgroundColor: '#0096f0',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096f0',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bookNowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
