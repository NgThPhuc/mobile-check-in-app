// src/screens/StatsScreen.tsx
// Màn hình thống kê check-in - UI COMPACT

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { CheckinStats, getCheckinStats } from '../api/checkin.api';

export default function StatsScreen() {
  const route = useRoute<any>();
  const { eventId, eventTitle } = route.params || {};

  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!eventId) return;
    try {
      if (!refreshing) setLoading(true);
      const data = await getCheckinStats(eventId);
      setStats(data);
    } catch (error) {
      console.log('Lỗi tải stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [eventId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit',
    });
  };

  const totalIssued = stats?.total_issued ?? stats?.total_tickets ?? 0;
  const checkedIn = stats?.checked_in ?? 0;
  const notCheckedIn = stats?.not_checked_in ?? 0;
  const revokedCount = stats?.revoked_count ?? 0;
  const refundedCount = stats?.refunded_count ?? 0;
  const totalScans = stats?.total_scans ?? 0;
  const failedScans = stats?.failed_scans ?? 0;
  const successRate = stats?.success_rate ?? 0;
  const checkinRate = stats?.checkin_rate ?? (totalIssued > 0 ? Math.round((checkedIn / totalIssued) * 100) : 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê</Text>
        <Text style={styles.subTitle} numberOfLines={1}>{eventTitle}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !stats ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
        ) : stats ? (
          <>
            {/* THỐNG KÊ VÉ - COMPACT */}
            <View style={styles.ticketStatsCard}>
              <View style={styles.mainStats}>
                <View style={styles.mainStatItem}>
                  <Text style={styles.mainStatNumber}>{checkedIn}</Text>
                  <Text style={styles.mainStatLabel}>Đã vào</Text>
                </View>
                <View style={styles.mainStatDivider}>
                  <Text style={styles.mainStatSlash}>/</Text>
                </View>
                <View style={styles.mainStatItem}>
                  <Text style={[styles.mainStatNumber, { color: '#8E8E93' }]}>{totalIssued}</Text>
                  <Text style={styles.mainStatLabel}>Tổng vé</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${checkinRate}%` }]} />
              </View>
              <Text style={styles.progressText}>{checkinRate}% đã check-in</Text>
              
              <View style={styles.subStats}>
                <View style={styles.subStatItem}>
                  <Ionicons name="time" size={14} color="#FF9500" />
                  <Text style={styles.subStatText}>{notCheckedIn} chưa vào</Text>
                </View>
                {/* <View style={styles.subStatItem}>
                  <Ionicons name="ban" size={14} color="#FF3B30" />
                  <Text style={styles.subStatText}>{revokedCount} thu hồi</Text>
                </View>
                <View style={styles.subStatItem}>
                  <Ionicons name="card" size={14} color="#AF52DE" />
                  <Text style={styles.subStatText}>{refundedCount} hoàn tiền</Text>
                </View> */}
              </View>
            </View>

            {/* THỐNG KÊ QUÉT */}
            <View style={styles.scanStatsCard}>
              <Text style={styles.cardTitle}>Thống kê quét</Text>
              
              <View style={styles.scanRow}>
                <View style={styles.scanItem}>
                  <Text style={styles.scanNumber}>{totalScans}</Text>
                  <Text style={styles.scanLabel}>Tổng quét</Text>
                </View>
                <View style={styles.scanItem}>
                  <Text style={[styles.scanNumber, { color: '#FF3B30' }]}>{failedScans}</Text>
                  <Text style={styles.scanLabel}>Thất bại</Text>
                </View>
                <View style={styles.scanItem}>
                  <Text style={[styles.scanNumber, { color: successRate >= 80 ? '#34C759' : '#FF9500' }]}>
                    {successRate}%
                  </Text>
                  <Text style={styles.scanLabel}>Thành công</Text>
                </View>
              </View>
              
              {stats.last_check_in_at && (
                <View style={styles.lastCheckin}>
                  <Ionicons name="time-outline" size={14} color="#8E8E93" />
                  <Text style={styles.lastCheckinText}>Gần nhất: {formatTime(stats.last_check_in_at)}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#C7C7CC" />
            <Text style={styles.emptyText}>Không có dữ liệu</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: { 
    padding: 20, 
    paddingTop: 15,
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderColor: '#E5E5EA',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  subTitle: { fontSize: 14, color: '#666', marginTop: 4 },
  scrollView: { flex: 1 },
  content: { padding: 15, paddingBottom: 30 },
  
  // Ticket Stats Card
  ticketStatsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  mainStatItem: { alignItems: 'center', minWidth: 80 },
  mainStatDivider: { marginHorizontal: 15 },
  mainStatSlash: { fontSize: 30, color: '#E5E5EA', fontWeight: '300' },
  mainStatNumber: { fontSize: 36, fontWeight: 'bold', color: '#34C759' },
  mainStatLabel: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  
  progressContainer: { 
    height: 8, 
    backgroundColor: '#E5E5EA', 
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: '#34C759', borderRadius: 4 },
  progressText: { textAlign: 'center', fontSize: 13, color: '#34C759', marginTop: 8, fontWeight: '600' },
  
  subStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  subStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  subStatText: { fontSize: 12, color: '#666' },
  
  // Scan Stats Card
  scanStatsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 15 },
  scanRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scanItem: { alignItems: 'center' },
  scanNumber: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  scanLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  
  lastCheckin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    gap: 6,
  },
  lastCheckinText: { color: '#8E8E93', fontSize: 13 },
  
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 },
});