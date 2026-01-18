// src/screens/HistoryScreen.tsx
// Màn hình lịch sử check-in - UI COMPACT với Detail Modal

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { getCheckinHistory } from '../api/checkin.api';

interface HistoryItem {
  id: string;
  ticket_serial: string;
  attendee_name: string;
  attendee_email?: string;
  ticket_type: string;
  checked_in_at: string;
  checked_in_gate: string;
  checked_in_by: string;
  scan_count: number;
}

export default function HistoryScreen() {
  const route = useRoute<any>();
  const { eventId } = route.params || {};

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGate, setSelectedGate] = useState('all');
  const [availableGates, setAvailableGates] = useState<string[]>([]);
  const [meta, setMeta] = useState<any>(null);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchHistory = async () => {
    if (!eventId) return;
    try {
      const response = await getCheckinHistory(eventId);
      const list = Array.isArray(response) ? response : response.data || response;
      setHistory(list);
      if (response.filters?.available_gates) {
        setAvailableGates(response.filters.available_gates);
      }
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (error) {
      console.log('Lỗi tải lịch sử', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [eventId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filteredHistory = useMemo(() => {
    let result = [...history];
    if (selectedGate !== 'all') {
      result = result.filter(item => item.checked_in_gate === selectedGate);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.attendee_name?.toLowerCase().includes(query) ||
        item.ticket_serial?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [history, searchQuery, selectedGate]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const openDetail = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.row} onPress={() => openDetail(item)} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowName} numberOfLines={1}>{item.attendee_name}</Text>
        <Text style={styles.rowSub}>{item.ticket_type} • {item.checked_in_by}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowTime}>{formatTime(item.checked_in_at)}</Text>
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử quét</Text>
        {meta && <Text style={styles.headerCount}>{meta.total} lượt</Text>}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, mã vé..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Gate Filter */}
      {availableGates.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedGate === 'all' && styles.filterActive]}
            onPress={() => setSelectedGate('all')}
          >
            <Text style={[styles.filterText, selectedGate === 'all' && styles.filterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {availableGates.map((gate) => (
            <TouchableOpacity
              key={gate}
              style={[styles.filterChip, selectedGate === gate && styles.filterActive]}
              onPress={() => setSelectedGate(gate)}
            >
              <Text style={[styles.filterText, selectedGate === gate && styles.filterTextActive]}>{gate}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={40} color="#C7C7CC" />
              <Text style={styles.emptyText}>Chưa có check-in</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={showDetailModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Check-in</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedItem && (
              <View style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tên khách</Text>
                  <Text style={styles.detailValue}>{selectedItem.attendee_name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedItem.attendee_email || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mã vé</Text>
                  <Text style={[styles.detailValue, { color: '#007AFF' }]}>{selectedItem.ticket_serial}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loại vé</Text>
                  <Text style={styles.detailValue}>{selectedItem.ticket_type}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Thời gian</Text>
                  <Text style={styles.detailValue}>{formatDateTime(selectedItem.checked_in_at)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cổng</Text>
                  <Text style={styles.detailValue}>{selectedItem.checked_in_gate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nhân viên</Text>
                  <Text style={styles.detailValue}>{selectedItem.checked_in_by}</Text>
                </View>
                
                {selectedItem.scan_count > 1 && (
                  <View style={styles.scanCountBadge}>
                    <Ionicons name="warning" size={14} color="#FF9500" />
                    <Text style={styles.scanCountText}>Đã quét {selectedItem.scan_count} lần</Text>
                  </View>
                )}
              </View>
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderColor: '#E5E5EA',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  headerCount: { fontSize: 14, color: '#8E8E93' },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#000',
  },
  
  filterScroll: { maxHeight: 36, marginTop: 10, paddingHorizontal: 15 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#E5E5EA',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterActive: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 12, color: '#666', fontWeight: '500', lineHeight: 14 },
  filterTextActive: { color: '#fff' },
  
  list: { padding: 10 },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 4,
  },
  rowLeft: { flex: 1, marginRight: 10 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#000' },
  rowSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowTime: { fontSize: 13, color: '#007AFF', fontWeight: '500' },
  
  separator: { height: 0 },
  
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#8E8E93', marginTop: 10 },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  modalBody: { padding: 16 },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: { fontSize: 14, color: '#8E8E93' },
  detailValue: { fontSize: 14, color: '#000', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 10 },
  
  scanCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 15,
    gap: 6,
  },
  scanCountText: { fontSize: 13, color: '#FF9500', fontWeight: '500' },
  
  closeButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
});