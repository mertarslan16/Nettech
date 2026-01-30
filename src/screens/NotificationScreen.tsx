import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client/apiClient';

const iconMapping: Record<string, string> = {
  ClockIcon: 'tabler-clock',
  ShoppingCartIcon: 'tabler-shopping-cart',
  AlertCircleIcon: 'tabler-alert-circle',
  UserIcon: 'tabler-user',
  PackageIcon: 'tabler-package',
  BellIcon: 'tabler-bell',
};

type NotificationItem = {
  id: number | string;
  title: string;
  message: string;
  time: string;
  timestamp: Date | null;
  icon: string;
  color: string;
  read: boolean;
  to: string | null;
  rawData?: any;
};

function formatRelativeTime(d: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return `${diff} saniye önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

async function fetchNotificationsFromApi(): Promise<NotificationItem[]> {
  const res = await apiClient.get<any>('/user/notifications');

  // Expecting array in res.data or res.data.notifications
  const rawList =
    (res && res.success && Array.isArray(res.data) && res.data) ||
    (res &&
      res.success &&
      res.data &&
      Array.isArray(res.data.notifications) &&
      res.data.notifications) ||
    [];

  const mapped: NotificationItem[] = rawList
    .slice()
    .reverse()
    .map((n: any) => ({
      id: n.id,
      title: n.data?.title || 'Bildirim',
      message: (n.data?.message || '').replace(/<br\s*\/?/gi, ' '),
      time: n.created_at ? formatRelativeTime(new Date(n.created_at)) : '',
      timestamp: n.created_at ? new Date(n.created_at) : null,
      icon: iconMapping[n.data?.icon] || 'tabler-bell',
      color:
        n.data?.category === 'success'
          ? 'success'
          : n.data?.category === 'warning'
          ? 'warning'
          : n.data?.category === 'error'
          ? 'error'
          : 'info',
      read: !!n.read_at,
      to: n.data?.to || null,
      rawData: n,
    }));

  return mapped;
}

function NotificationScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const list = await fetchNotificationsFromApi();
      setNotifications(list);
    } catch (err) {
      console.error('Bildirimler yüklenirken hata:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.item, item.read ? styles.read : styles.unread]}
      activeOpacity={0.8}
    >
      <View style={styles.itemLeft}>
        <View style={styles.iconPlaceholder} />
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={3} ellipsizeMode="tail">
          {item.message}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && notifications.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text>Gösterilecek bildirim yok.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  unread: {
    backgroundColor: '#f8fbff',
  },
  read: {
    opacity: 0.7,
  },
  itemLeft: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  itemBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#444',
  },
  itemRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
});

export default NotificationScreen;
