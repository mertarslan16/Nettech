import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';
import fonts from '../theme/fonts';
import { useCart, CartItem } from '../context/CartContext';
import { RootTabParamList } from '../types/navigation';

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

// Kargo seçenekleri
const SHIPPING_OPTIONS = [
  { id: 'store', label: 'Mağazadan Teslim', price: 0 },
  { id: 'aras', label: 'Aras Kargo', price: 50 },
  { id: 'mng', label: 'MNG Kargo', price: 45 },
  { id: 'yurtici', label: 'Yurtiçi Kargo', price: 55 },
];

function BasketScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    cartItems,
    cartType,
    cartAccount,
    cartOrder,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearAccount,
    navigateToShop,
    getTotalQuantity,
    getTotalAmount,
  } = useCart();

  const TAB_BAR_HEIGHT = 56;

  // Kargo state
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);

  // Debug log
  console.log('📦 Sepet Tipi:', cartType);
  console.log('🏪 Bayi Verisi:', cartAccount);
  console.log('📋 Sipariş Verisi:', cartOrder);

  // Sepet tipleri kontrolleri
  const isOrderCart = cartType === 'ORDER';
  const isResellerCart = cartType === 'RESELLER';

  // Risk limit hesaplama
  const invoiceLimit = useMemo(() => {
    if (cartAccount?.invoice_limit) return cartAccount.invoice_limit;
    if (cartOrder?.invoice_limit) return cartOrder.invoice_limit;
    return 0;
  }, [cartAccount, cartOrder]);

  const remainingLimit = useMemo(() => {
    return invoiceLimit - getTotalAmount();
  }, [invoiceLimit, getTotalAmount]);

  const isOverLimit = remainingLimit < 0;


  // Seçili kargo bilgisi
  const selectedShippingOption = useMemo(() => {
    return SHIPPING_OPTIONS.find(opt => opt.id === selectedShipping);
  }, [selectedShipping]);

  // Kargo ücreti (100 TL üzeri ücretsiz)
  const shippingPrice = useMemo(() => {
    if (!selectedShipping) return 0;
    if (getTotalAmount() >= 100) return 0;
    return selectedShippingOption?.price || 0;
  }, [selectedShipping, selectedShippingOption, getTotalAmount]);

  // Genel toplam
  const grandTotal = useMemo(() => {
    return getTotalAmount() + shippingPrice;
  }, [getTotalAmount, shippingPrice]);

  const formatMoney = (value: number) => {
    return value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getCurrency = (item: CartItem) => {
    return item.unitCurrency || item.price1_cur || 'TL';
  };

  const getPrice = (item: CartItem) => {
    return item.unitPrice ?? item.price1 ?? 0;
  };

  const handleIncrement = (item: CartItem) => {
    updateQuantity(item.id, (item.qty || 1) + 1, item.selectedColor);
  };

  const handleDecrement = (item: CartItem) => {
    if ((item.qty || 1) > 1) {
      updateQuantity(item.id, (item.qty || 1) - 1, item.selectedColor);
    }
  };

  const handleRemove = (item: CartItem) => {
    Alert.alert('Ürünü Sil', `"${item.name}" sepetten silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => removeFromCart(item.id, item.selectedColor),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Sepeti Temizle',
      'Tüm ürünler sepetten silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: clearCart,
        },
      ],
    );
  };

  const handleContinueShopping = () => {
    navigateToShop();
    navigation.navigate('Dashboard');
  };

  const handleCreateOrder = () => {
    const orderPayload = {
      items: cartItems.map(item => ({
        id: item.id,
        quantity: item.qty || 1,
        name: item.name,
        price: getPrice(item),
        currency: getCurrency(item),
      })),
      totalAmount: getTotalAmount(),
      totalQuantity: getTotalQuantity(),
    };

    console.log('📦 Sipariş Oluştur - Gönderilecek Veriler:');
    console.log(JSON.stringify(orderPayload, null, 2));

    Alert.alert(
      'Sipariş Bilgisi',
      `${getTotalQuantity()} ürün, toplam ${formatMoney(
        getTotalAmount(),
      )} TL\n\nDetaylar console'da görüntülendi.`,
      [{ text: 'Tamam' }],
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const price = getPrice(item);
    const currency = getCurrency(item);
    const lineTotal = price * (item.qty || 1);

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemImageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Icon
                name="package-variant"
                size={32}
                color={colors.textLighter}
              />
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          {/* <Text style={styles.itemCode}>Kod: {item.id}</Text>
          {item.barcode && (
            <Text style={styles.itemBarcode}>Barkod: {item.barcode}</Text>
          )} */}
          {/* <Text style={styles.itemPrice}>
            {formatMoney(price)} {currency}
          </Text> */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.qtyButton,
                (item.qty || 1) <= 1 && styles.qtyButtonDisabled,
              ]}
              onPress={() => handleDecrement(item)}
              disabled={(item.qty || 1) <= 1}
            >
              <Icon
                name="minus"
                size={12}
                color={(item.qty || 1) <= 1 ? colors.disabled : colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.qty || 1}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleIncrement(item)}
            >
              <Icon name="plus" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.lineTotal}>
            {formatMoney(lineTotal)} {currency}
          </Text>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item)}
          >
            <Icon name="trash-can-outline" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Icon name="cart-off" size={64} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Sepetiniz boş</Text>
      <Text style={styles.emptySubtitle}>
        Alışverişe başlamak için ürün ekleyin.
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={handleContinueShopping}
      >
        <Icon name="arrow-left" size={20} color="#fff" />
        <Text style={styles.shopButtonText}>Alışverişe Dön</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Icon name="cart" size={28} color={colors.primary} />
        <Text style={styles.headerTitle}>Sepetiniz</Text>
        {cartItems.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getTotalQuantity()} Ürün</Text>
          </View>
        )}
      </View>
      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart}>
          <Icon name="trash-can-outline" size={18} color={colors.error} />
          <Text style={styles.clearButtonText}>Temizle</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSummary = () => {
    if (cartItems.length === 0) return null;

    const isFreeShipping = getTotalAmount() >= 100;

    return (
      <View style={styles.summaryCard}>
        {/* Sipariş Veren (ORDER sepeti için) */}
        {isOrderCart && cartOrder && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sipariş Veren:</Text>
            <Text style={styles.infoValue}>{cartOrder.name}</Text>
          </View>
        )}

        {/* Bayi Bilgisi (RESELLER sepeti için) */}
        {isResellerCart && cartAccount && (
          <>
            <View style={styles.resellerHeader}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bayi:</Text>
                <Text style={styles.infoValue}>{cartAccount.name}</Text>
              </View>
              <TouchableOpacity onPress={clearAccount} style={styles.clearAccountBtn}>
                <Icon name="close" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
            <View style={styles.summaryDivider} />
          </>
        )}

        {/* Risk Limit (RESELLER sepeti için) */}
        {isResellerCart && invoiceLimit > 0 && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Risk Limit</Text>
              <Text style={[
                styles.summaryValue,
                isOverLimit ? styles.textError : styles.textSuccess,
              ]}>
                {formatMoney(remainingLimit)} TL
              </Text>
            </View>
            {isOverLimit && (
              <Text style={styles.limitWarning}>
                Risk limitinizi aştınız!
              </Text>
            )}
            <View style={styles.summaryDivider} />
          </>
        )}

        {/* Kargo Firması Seçimi (ORDER sepeti değilse) */}
        {!isOrderCart && (
          <>
            <Text style={styles.sectionTitle}>Kargo Firması</Text>
            <TouchableOpacity
              style={styles.shippingSelect}
              onPress={() => setShowShippingModal(true)}
            >
              <Text style={selectedShipping ? styles.shippingSelectedText : styles.shippingPlaceholder}>
                {selectedShippingOption?.label || 'Kargo Seçiniz'}
              </Text>
              <Icon name="chevron-down" size={20} color={colors.textLight} />
            </TouchableOpacity>
            <View style={styles.summaryDivider} />
          </>
        )}

        {/* Ara Toplam */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ara Toplam</Text>
          <Text style={styles.summaryValue}>
            {formatMoney(getTotalAmount())} TL
          </Text>
        </View>

        {/* Taşıma Bedeli */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taşıma Bedeli</Text>
          {isFreeShipping ? (
            <Text style={styles.freeShippingText}>Ücretsiz</Text>
          ) : (
            <Text style={styles.summaryValue}>
              {formatMoney(shippingPrice)} TL
            </Text>
          )}
        </View>

        {isFreeShipping && (
          <Text style={styles.freeShippingNote}>
            100 TL üzeri siparişlerde kargo ücretsiz!
          </Text>
        )}

        <View style={styles.summaryDivider} />

        {/* Genel Toplam */}
        <View style={styles.summaryRow}>
          <Text style={styles.grandTotalLabel}>Genel Toplam</Text>
          <Text style={styles.grandTotalValue}>
            {formatMoney(grandTotal)} TL
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.orderButton,
            !selectedShipping && styles.orderButtonDisabled,
          ]}
          onPress={handleCreateOrder}
          disabled={!selectedShipping}
        >
          <Icon name="shopping" size={20} color="#fff" />
          <Text style={styles.orderButtonText}>Sipariş Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueShopping}
        >
          <Icon name="arrow-left" size={18} color={colors.primary} />
          <Text style={styles.continueButtonText}>Alışverişe Devam Et</Text>
        </TouchableOpacity>

        {/* Kargo Seçim Modal */}
        <Modal
          visible={showShippingModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowShippingModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowShippingModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Kargo Firması Seçin</Text>
              {SHIPPING_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.shippingOption,
                    selectedShipping === option.id && styles.shippingOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedShipping(option.id);
                    setShowShippingModal(false);
                  }}
                >
                  <View style={styles.shippingOptionLeft}>
                    <Icon
                      name={selectedShipping === option.id ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={selectedShipping === option.id ? colors.primary : colors.textLight}
                    />
                    <Text style={styles.shippingOptionLabel}>{option.label}</Text>
                  </View>
                  <Text style={styles.shippingOptionPrice}>
                    {option.price === 0 ? 'Ücretsiz' : `${formatMoney(option.price)} TL`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={item => `${item.id}-${item.selectedColor || ''}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 16 },
          ]}
          ListFooterComponent={renderSummary}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
    marginLeft: 10,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 14,
    fontFamily: fonts.medium,
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  itemBarcode: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textLighter,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginTop: 6,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 2,
    maxWidth: 80,
  },
  qtyButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  qtyButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  qtyText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.text,
    marginHorizontal: 6,
    minWidth: 16,
    textAlign: 'center',
  },
  lineTotal: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.text,
    marginTop: 8,
  },
  removeButton: {
    padding: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 157, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 16,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  continueButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: fonts.medium,
    marginLeft: 6,
  },
  // Kargo seçimi stilleri
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 8,
  },
  shippingSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  shippingSelectedText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  shippingPlaceholder: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  freeShippingText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  freeShippingNote: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.success,
    marginBottom: 12,
    marginTop: -8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  orderButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  shippingOptionSelected: {
    backgroundColor: 'rgba(249, 157, 38, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  shippingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingOptionLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
    marginLeft: 10,
  },
  shippingOptionPrice: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.textLight,
  },
  // Bayi ve risk limit stilleri
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  resellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearAccountBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
  },
  textError: {
    color: colors.error,
  },
  textSuccess: {
    color: colors.success,
  },
  limitWarning: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.error,
    marginBottom: 12,
    marginTop: -8,
  },
});

export default BasketScreen;
