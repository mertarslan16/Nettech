import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { StoreStock } from '../types/product';
// import colors from '../theme/colors';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface StoreStockListProps {
  storeStocks: StoreStock[];
  totalStock: number;
}

function StoreStockList({ storeStocks, totalStock }: StoreStockListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getStockColor = (stock: string) => {
    const stockNum = parseFloat(stock);
    if (stockNum >= 50) return '#4CAF50';
    if (stockNum >= 20) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      {/* Header - Always Visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Mağaza Stokları</Text>
          <Text style={styles.totalStock}>
            Toplam: <Text style={styles.totalStockValue}>{totalStock}</Text>{' '}
            adet
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.storeCount}>{storeStocks.length} mağaza</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Expandable Content */}
      {isExpanded && (
        <View style={styles.stockList}>
          {storeStocks.map((store, index) => (
            <View
              key={store.store_id}
              style={[
                styles.stockRow,
                index === storeStocks.length - 1 && styles.lastRow,
              ]}
            >
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              <View style={styles.stockBadgeContainer}>
                <View
                  style={[
                    styles.stockBadge,
                    { backgroundColor: getStockColor(store.stock) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stockValue,
                      { color: getStockColor(store.stock) },
                    ]}
                  >
                    {parseFloat(store.stock).toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  totalStock: {
    fontSize: 13,
    color: '#666',
  },
  totalStockValue: {
    fontWeight: '700',
    color: 'colors.primary',
  },
  storeCount: {
    fontSize: 13,
    color: '#999',
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: 'colors.primary',
  },
  stockList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  storeName: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    marginRight: 12,
  },
  stockBadgeContainer: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default StoreStockList;
