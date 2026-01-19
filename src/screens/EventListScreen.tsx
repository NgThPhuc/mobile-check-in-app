// src/screens/EventListScreen.tsx
// Màn hình danh sách sự kiện - UI Compact Dashboard (New Design)

import { MaterialIcons } from '@expo/vector-icons'; // Đổi sang MaterialIcons cho giống mẫu
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
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Event, getEvents } from '../api/events.api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

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
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      dateShort: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  // Cập nhật màu sắc status theo chuẩn Tailwind của mẫu
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : null;

    if (endDate && now > endDate) {
      return { label: 'Đã kết thúc', color: '#94A3B8', dotColor: '#94A3B8' }; // slate-400
    }
    if (now >= startDate && (!endDate || now <= endDate)) {
      return { label: 'Đang diễn ra', color: '#10B981', dotColor: '#10B981' }; // emerald-500
    }
    return { label: 'Sắp diễn ra', color: '#3B82F6', dotColor: '#3B82F6' }; // blue-500
  };

  const renderItem = ({ item }: { item: Event }) => {
    const dateInfo = formatDate(item.start_at);
    const status = getEventStatus(item);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectEvent(item)}
        activeOpacity={0.7}
      >
        {/* Left Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200' }}
            style={styles.cardImage}
          />
          {/* Floating Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{dateInfo.day}</Text>
            <Text style={styles.dateMonth}>T{dateInfo.month}</Text>
          </View>
        </View>

        {/* Center Info Section */}
        <View style={styles.infoContainer}>
          {/* Status Line */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>

          {/* Title */}
          <Text style={styles.eventTitle} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <MaterialIcons name="schedule" size={14} color="#64748B" />
              <Text style={styles.metaText}>{dateInfo.time} - {dateInfo.dateShort}</Text>
            </View>
            <View style={styles.metaRow}>
              <MaterialIcons name="place" size={14} color="#64748B" />
              <Text style={styles.metaText} numberOfLines={1}>{item.venue_name}</Text>
            </View>
          </View>
        </View>

        {/* Right Action Button */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButton}>
            <MaterialIcons name="qr-code-2" size={20} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const displayName = user?.full_name || 'Staff';
  // Lấy chữ cái đầu của tên để làm avatar text
  const avatarLabel = displayName.charAt(0).toUpperCase() + (displayName.split(' ').pop()?.charAt(0).toUpperCase() || '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Spacing for Status Bar */}
      <View style={{ height: 10 }} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.username}>
            {displayName}
            {'\n'}
            <Text style={styles.organizationText}>
               {/* Giả lập Organization nếu chưa có trong user store */}
               Organization 01
            </Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={() => navigation.navigate('Profile')}
        >
          {user?.avatar_url ? (
             <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{avatarLabel || 'ST'}</Text>
            </View>
          )}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* SEARCH SECTION */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm kiếm sự kiện..."
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialIcons name="tune" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* SECTION TITLE */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitle}>SỰ KIỆN</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{events.length}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* LIST CONTENT */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Chưa có sự kiện nào</Text>
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
    backgroundColor: '#F8FAFC', // background-light
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 12,
    color: '#64748B', // slate-500
    fontWeight: '500',
    marginBottom: 2,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A', // slate-900
    lineHeight: 24,
  },
  organizationText: {
    fontSize: 14,
    color: '#3B82F6', // primary blue
    fontWeight: '500',
  },
  profileButton: {
    position: 'relative',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6', // fallback gradient substitute
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: '#EF4444', // red-500
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Search Styles
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14,
    color: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    width: 44,
    height: 44, // khớp chiều cao input
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },

  // Section Title Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B', // slate-800
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // primary/10
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '700',
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },

  // List Styles
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Để tránh bị che bởi nav bar nếu có
    gap: 12,
  },

  // Card Styles (Compact Row)
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)', // slate-200/60
    gap: 12,
    // Card Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Card - Image Section
  imageContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  dateBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    minWidth: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    lineHeight: 14,
  },
  dateMonth: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },

  // Card - Info Section
  infoContainer: {
    flex: 1,
    minWidth: 0, // quan trọng để text truncate hoạt động
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 20,
  },
  metaContainer: {
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },

  // Card - Action Section
  actionContainer: {
    flexShrink: 0,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Utilities
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});