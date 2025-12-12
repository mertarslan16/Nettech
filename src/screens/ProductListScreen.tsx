import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraStackParamList } from '../types/navigation';
import { searchProducts, type Product } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTabBar } from '../context/TabBarContext';

type Props = NativeStackScreenProps<CameraStackParamList, 'ProductList'>;

function ProductListScreen({ route, navigation }: Props) {
  const {
    categoryId,
    categoryName,
    brandId,
    brandName,
    searchQuery: initialSearchQuery,
  } = route.params;
  const insets = useSafeAreaInsets();
  const { showTabBar, hideTabBar } = useTabBar();
  const lastScrollY = useRef(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [isSearching, setIsSearching] = useState(false);

  // Infinite scroll state'leri
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Başlık oluştur
  const getTitle = () => {
    if (categoryName && brandName) {
      return `${categoryName} - ${brandName}`;
    } else if (categoryName) {
      return categoryName;
    } else if (brandName) {
      return brandName;
    }
    return 'Ürün Listesi';
  };

  // Header padding style - memoized
  const headerStyle = useMemo(
    () => [styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }],
    [insets.top],
  );

  // Ürünleri yükle
  const loadProducts = useCallback(
    async (query: string = '', page: number = 1) => {
      // İlk sayfa için ana loading, diğer sayfalar için isLoadingMore kullan
      if (page === 1) {
        setIsLoading(true);
      }

      try {
        // Arama query'si oluştur
        let searchText = query;

        // Eğer query yoksa, kategori veya marka ismini kullan
        if (!searchText) {
          if (categoryName) {
            searchText = categoryName;
          } else if (brandName) {
            searchText = brandName;
          }
        }

        const response = await searchProducts(searchText, page);

        if (response.success && response.data) {
          let filteredProducts = response.data;

          // Kategori filtresi uygula
          if (categoryId) {
            filteredProducts = filteredProducts.filter(
              p => p.category_id === categoryId,
            );
          }

          // Marka filtresi - API'den marka ID'si ile filtreleme yapılamadığı için
          // İsimle filtreleme yapıyoruz (daha doğru bir çözüm için API'ye brand_id parametresi eklenebilir)
          if (brandName) {
            filteredProducts = filteredProducts.filter(p =>
              p.name.toLowerCase().includes(brandName.toLowerCase()),
            );
          }

          // İlk sayfa ise ürünleri değiştir, değilse ekle
          if (page === 1) {
            setProducts(filteredProducts);
          } else {
            setProducts(prev => [...prev, ...filteredProducts]);
          }

          // Eğer 50'den az ürün geldiyse, daha fazla sayfa yok
          setHasMore(filteredProducts.length === 50);
        } else {
          if (page === 1) {
            setProducts([]);
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error('Product load error:', err);
        if (page === 1) {
          setProducts([]);
        }
        setHasMore(false);
      } finally {
        if (page === 1) {
          setIsLoading(false);
        }
      }
    },
    [categoryId, categoryName, brandName],
  );

  // İlk yükleme
  useEffect(() => {
    loadProducts(initialSearchQuery);
  }, [categoryId, brandId, initialSearchQuery, loadProducts]);

  // Daha fazla ürün yükle (infinite scroll)
  const loadMoreProducts = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProducts(searchQuery, nextPage).finally(() => {
        setIsLoadingMore(false);
      });
    }
  };

  // Arama fonksiyonu - debounce ile
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      // Arama query'si yoksa, filtre parametrelerine göre yükle
      setCurrentPage(1);
      setHasMore(true);
      loadProducts('', 1);
      return;
    }
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setHasMore(true);
      loadProducts(searchQuery, 1);
      setIsSearching(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadProducts]);

  // Ürün seçimi
  const handleProductPress = async (product: Product) => {
    // ProductDetail sayfasına git
    navigation.navigate('ProductDetail', {
      barcode: product.barcode,
    });
  };

  // Scroll handler - aşağı kaydırınca tab bar gizle, yukarı kaydırınca göster
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentScrollY - lastScrollY.current;

    // Sadece belirli bir eşik değerini geçtikten sonra tepki ver (5px)
    if (Math.abs(scrollDiff) > 5) {
      if (scrollDiff > 0 && currentScrollY > 50) {
        // Aşağı kaydırılıyor - tab bar'ı gizle
        hideTabBar();
      } else if (scrollDiff < 0) {
        // Yukarı kaydırılıyor - tab bar'ı göster
        showTabBar();
      }
    }

    lastScrollY.current = currentScrollY;
  };

  // Ürün render fonksiyonu
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      {item.coverUrlThumb ? (
        <Image
          source={{ uri: item.coverUrlThumb }}
          style={styles.productImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Icon name="package-variant" size={48} color="#ccc" />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBarcode}>{item.barcode}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            {item.price5} {item.price5_cur}
          </Text>
          {item.totalStock > 0 ? (
            <View style={styles.stockBadge}>
              <Icon name="check-circle" size={14} color="#4CAF50" />
              <Text style={styles.stockText}>{item.totalStock} Adet</Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, styles.stockBadgeEmpty]}>
              <Icon name="close-circle" size={14} color="#F44336" />
              <Text style={[styles.stockText, styles.stockTextEmpty]}>
                Stokta Yok
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
        </View>
      </View>

      {/* Arama Input */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Ürünler içinde ara..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
        {isSearching && (
          <ActivityIndicator
            size="small"
            color="#F99D26"
            style={styles.searchLoader}
          />
        )}
      </View>

      {/* Ürün Listesi */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F99D26" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant-closed" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Ürün Bulunamadı</Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Arama kriterlerine uygun ürün bulunamadı'
              : 'Bu kategoride ürün bulunmuyor'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#F99D26" />
                <Text style={styles.footerLoaderText}>
                  Daha fazla ürün yükleniyor...
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#F99D26',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchLoader: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F99D26',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeEmpty: {
    backgroundColor: '#FFEBEE',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  stockTextEmpty: {
    color: '#F44336',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
  },
});

export default ProductListScreen;
