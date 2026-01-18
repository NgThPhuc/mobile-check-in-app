// src/screens/EventListScreen.tsx
// Màn hình danh sách sự kiện - UI Premium

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView, StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Event, getEvents } from '../api/events.api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function EventListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getEvents();
      const eventList = Array.isArray(data) ? data : data.data || [];
      setEvents(eventList);
    } catch (error) {
      console.log('Lỗi tải events:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sự kiện');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleSelectEvent = (event: Event) => {
    navigation.navigate('MainTabs', { 
      eventId: event.id, 
      eventTitle: event.title 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('vi-VN', { 
        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' 
      })
    };
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : null;
    
    if (endDate && now > endDate) {
      return { label: 'Đã kết thúc', color: '#8E8E93', bgColor: '#F2F2F7' };
    }
    if (now >= startDate && (!endDate || now <= endDate)) {
      return { label: 'Đang diễn ra', color: '#34C759', bgColor: '#E8F8EE' };
    }
    return { label: 'Sắp diễn ra', color: '#007AFF', bgColor: '#E8F4FD' };
  };

  const renderItem = ({ item, index }: { item: Event; index: number }) => {
    const dateInfo = formatDate(item.start_at);
    const status = getEventStatus(item);
    
    return (
      <TouchableOpacity 
        style={[styles.card, { marginTop: index === 0 ? 15 : 0 }]} 
        onPress={() => handleSelectEvent(item)}
        activeOpacity={0.9}
      >
        {/* Image with Overlay */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' }} 
            style={styles.cardImage} 
            resizeMode="cover"
          />
          {/* Dark Gradient Overlay */}
          <View style={styles.imageOverlay} />
          
          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{dateInfo.day}</Text>
            <Text style={styles.dateMonth}>Th{dateInfo.month}</Text>
          </View>
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={16} color="#007AFF" />
              </View>
              <Text style={styles.infoText}>
                {dateInfo.time} - {dateInfo.full}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={16} color="#FF6B6B" />
              </View>
              <Text style={styles.infoText} numberOfLines={1}>{item.venue_name}</Text>
            </View>

            {item.organization?.name && (
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="business-outline" size={16} color="#9C27B0" />
                </View>
                <Text style={styles.infoText} numberOfLines={1}>{item.organization.name}</Text>
              </View>
            )}
          </View>
          
          {/* Action Button */}
          <View style={styles.actionRow}>
            <View style={styles.ticketInfo}>
              <Ionicons name="ticket-outline" size={16} color="#666" />
              <Text style={styles.ticketText}>
                {item._count?.tickets ?? 0} vé
              </Text>
            </View>
            <View style={styles.checkinButton}>
              <Text style={styles.checkinButtonText}>Check-in</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const displayName = user?.full_name || 'Staff';
  const avatarUrl = user?.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=007AFF&color=fff`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.username}>{displayName}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Search Bar (Optional UI Element) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <Text style={styles.searchPlaceholder}>Tìm kiếm sự kiện...</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sự kiện được phân công</Text>
        <View style={styles.eventCount}>
          <Text style={styles.eventCountText}>{events.length}</Text>
        </View>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải sự kiện...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={60} color="#C7C7CC" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có sự kiện</Text>
              <Text style={styles.emptyText}>
                Bạn chưa được phân công vào sự kiện nào
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Ionicons name="refresh" size={18} color="#007AFF" />
                <Text style={styles.refreshButtonText}>Làm mới</Text>
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
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerLeft: {},
  greeting: { 
    fontSize: 14, 
    color: '#8E8E93',
    fontWeight: '500',
  },
  username: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#000',
    marginTop: 2,
  },
  profileButton: {
    position: 'relative',
  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: '#8E8E93',
    fontSize: 15,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 5,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#000',
  },
  eventCount: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // List
  list: { 
    paddingHorizontal: 20, 
    paddingBottom: 30,
  },
  
  // Card
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  cardImage: { 
    height: '100%', 
    width: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dateBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    lineHeight: 24,
  },
  dateMonth: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Card Content
  cardContent: { 
    padding: 18,
  },
  eventTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    color: '#000',
    lineHeight: 24,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: { 
    color: '#666', 
    fontSize: 14,
    flex: 1,
  },
  
  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  checkinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  checkinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    fontSize: 15,
  },
  
  // Empty
  emptyContainer: { 
    alignItems: 'center', 
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: { 
    color: '#8E8E93', 
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#E8F4FD',
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  },
});