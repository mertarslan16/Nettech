import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: number;
  name: string;
  image?: string;
  qty: number;
  price1: number;
  price1_cur: string;
  price2?: number;
  price2_cur?: string;
  unitPrice?: number;
  unitCurrency?: string;
  selectedColor?: string;
  barcode?: string;
}

// Sepet tipleri
export type CartType = 'ORDER' | 'RESELLER' | 'STORE' | null;

// Bayi/Hesap bilgisi tipi
export interface CartAccount {
  client_id?: number;
  customer_id?: number;
  name: string;
  invoice_limit?: number;
  currency?: string;
  priceTag?: string;
}

// Sipariş bilgisi tipi
export interface CartOrder {
  id: number;
  name: string;
  invoice_limit?: number;
  currency?: string;
  priceTag?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartType: CartType;
  cartAccount: CartAccount | null;
  cartOrder: CartOrder | null;
  webViewRef: React.RefObject<WebView | null>;
  setCartItems: (items: CartItem[]) => void;
  setCartType: (type: CartType) => void;
  setCartAccount: (account: CartAccount | null) => void;
  setCartOrder: (order: CartOrder | null) => void;
  updateQuantity: (itemId: number, qty: number, selectedColor?: string) => void;
  removeFromCart: (itemId: number, selectedColor?: string) => void;
  clearCart: () => void;
  clearAccount: () => void;
  navigateToShop: () => void;
  navigateToBasket: () => void;
  getTotalQuantity: () => number;
  getTotalAmount: () => number;
  setWebViewRef: (ref: React.RefObject<WebView | null>) => void;
  syncCartData: (data: { cartType?: string; cartAccount?: CartAccount; cartOrder?: CartOrder }) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartType, setCartTypeState] = useState<CartType>(null);
  const [cartAccount, setCartAccountState] = useState<CartAccount | null>(null);
  const [cartOrder, setCartOrderState] = useState<CartOrder | null>(null);
  const [webViewRefState, setWebViewRefState] = useState<React.RefObject<WebView | null> | null>(null);
  const internalWebViewRef = useRef<WebView | null>(null);

  const webViewRef = webViewRefState || internalWebViewRef;

  const setWebViewRef = (ref: React.RefObject<WebView | null>) => {
    setWebViewRefState(ref);
  };

  // CartType setter with AsyncStorage sync
  const setCartType = async (type: CartType) => {
    setCartTypeState(type);
    if (type) {
      await AsyncStorage.setItem('cartType', type);
    } else {
      await AsyncStorage.removeItem('cartType');
    }
  };

  // CartAccount setter with AsyncStorage sync
  const setCartAccount = async (account: CartAccount | null) => {
    setCartAccountState(account);
    if (account) {
      await AsyncStorage.setItem('cartAccount', JSON.stringify(account));
    } else {
      await AsyncStorage.removeItem('cartAccount');
    }
  };

  // CartOrder setter with AsyncStorage sync
  const setCartOrder = async (order: CartOrder | null) => {
    setCartOrderState(order);
    if (order) {
      await AsyncStorage.setItem('cartOrder', JSON.stringify(order));
    } else {
      await AsyncStorage.removeItem('cartOrder');
    }
  };

  // Bayi seçimini temizle
  const clearAccount = async () => {
    setCartAccountState(null);
    setCartTypeState(null);
    await AsyncStorage.multiRemove(['cartAccount', 'cartType']);
  };

  // WebView'dan gelen cart verilerini senkronize et
  const syncCartData = async (data: { cartType?: string; cartAccount?: CartAccount; cartOrder?: CartOrder }) => {
    console.log('🔄 Cart data syncing:', data);

    if (data.cartType !== undefined) {
      const type = data.cartType as CartType;
      setCartTypeState(type);
      if (type) {
        await AsyncStorage.setItem('cartType', type);
      } else {
        await AsyncStorage.removeItem('cartType');
      }
    }

    if (data.cartAccount !== undefined) {
      setCartAccountState(data.cartAccount);
      if (data.cartAccount) {
        await AsyncStorage.setItem('cartAccount', JSON.stringify(data.cartAccount));
      } else {
        await AsyncStorage.removeItem('cartAccount');
      }
    }

    if (data.cartOrder !== undefined) {
      setCartOrderState(data.cartOrder);
      if (data.cartOrder) {
        await AsyncStorage.setItem('cartOrder', JSON.stringify(data.cartOrder));
      } else {
        await AsyncStorage.removeItem('cartOrder');
      }
    }
  };

  const injectAndSync = (jsCode: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        ${jsCode}
        window.dispatchEvent(new StorageEvent('storage', { key: 'basket' }));
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'BASKET_DATA',
          basket: JSON.parse(localStorage.getItem('basket') || '[]')
        }));
        true;
      `);
    }
  };

  const updateQuantity = (itemId: number, qty: number, selectedColor?: string) => {
    const colorCondition = selectedColor
      ? `&& i.selectedColor === '${selectedColor}'`
      : '';

    injectAndSync(`
      const basket = JSON.parse(localStorage.getItem('basket') || '[]');
      const item = basket.find(i => i.id === ${itemId} ${colorCondition});
      if (item) item.qty = ${qty};
      localStorage.setItem('basket', JSON.stringify(basket));
    `);

    // Local state update
    setCartItems(prev => prev.map(item =>
      item.id === itemId && (!selectedColor || item.selectedColor === selectedColor)
        ? { ...item, qty }
        : item
    ));
  };

  const removeFromCart = (itemId: number, selectedColor?: string) => {
    const colorCondition = selectedColor
      ? `&& item.selectedColor === '${selectedColor}'`
      : '';

    injectAndSync(`
      const basket = JSON.parse(localStorage.getItem('basket') || '[]');
      const filtered = basket.filter(item => !(item.id === ${itemId} ${colorCondition}));
      localStorage.setItem('basket', JSON.stringify(filtered));
    `);

    // Local state update
    setCartItems(prev => prev.filter(item =>
      !(item.id === itemId && (!selectedColor || item.selectedColor === selectedColor))
    ));
  };

  const clearCart = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        localStorage.removeItem('basket');
        localStorage.removeItem('cartType');
        localStorage.removeItem('cartOrder');
        localStorage.removeItem('cartAccount');
        window.dispatchEvent(new StorageEvent('storage', { key: 'basket' }));
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'BASKET_DATA',
          basket: []
        }));
        true;
      `);
    }
    setCartItems([]);
  };

  const navigateToShop = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.location.href = '/order/shop?isStoreOrder=false';
        true;
      `);
    }
  };

  const navigateToBasket = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.location.href = '/basket/basket';
        true;
      `);
    }
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.unitPrice ?? item.price1 ?? 0;
      return sum + price * (item.qty || 0);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartType,
        cartAccount,
        cartOrder,
        webViewRef,
        setCartItems,
        setCartType,
        setCartAccount,
        setCartOrder,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearAccount,
        navigateToShop,
        navigateToBasket,
        getTotalQuantity,
        getTotalAmount,
        setWebViewRef,
        syncCartData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
