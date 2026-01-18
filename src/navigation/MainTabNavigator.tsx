import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

// Import các màn hình con
import CheckinScreen from '../screens/CheckinScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  // Nhận tham số (eventId, eventTitle) từ màn hình danh sách sự kiện truyền xuống
  const route = useRoute();
  const params = route.params || {}; 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'help';
          if (route.name === 'Scanner') iconName = focused ? 'qr-code' : 'qr-code-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tab 1: Màn hình Quét */}
      <Tab.Screen 
        name="Scanner" 
        component={CheckinScreen} 
        initialParams={params} // Truyền tiếp eventId xuống CheckinScreen
        options={{ title: 'Quét vé' }}
      />
      
      {/* Tab 2: Màn hình Lịch sử */}
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        initialParams={params} // Truyền tiếp eventId xuống HistoryScreen
        options={{ title: 'Lịch sử' }}
      />
      {/* Tab 3: Thống kê (MỚI) */}
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        initialParams={params}
        options={{ 
            title: 'Thống kê',
            tabBarIcon: ({ focused, color, size }) => (
                <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={size} color={color} />
            )
        }}
      />
    </Tab.Navigator>
  );
}