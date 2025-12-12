// Product Types for Product Detail Screen

export interface StoreStock {
  store_id: number;
  name: string;
  stock: string;
}

export interface ProductFeature {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  barcode: string;
  coverUrlThumb: string;
  totalStock: number;
  storeStocks: StoreStock[];
  weight: string;
  features: ProductFeature[];
  compatible_models: string[];
  sales_total: number;
  price1: number;
  price1_cur: string;
  price2: number;
  price2_cur: string;
  price5: number;
  price5_cur: string;
  price6: number;
  price6_cur: string;
  price8: number;
  price8_cur: string;
}

// Mock data for development
export const mockProduct: Product = {
  id: 67215,
  category_id: 5,
  name: 'Nettech Orta Boy Kraft Çanta (Kahverengi) NT-115895',
  barcode: '8680065546662',
  coverUrlThumb:
    '/storage/media/146107/conversions/PHOTO-2025-11-28-18-11-39-thumb.jpg',
  totalStock: 500,
  storeStocks: [
    { store_id: 3, name: 'NET-MERKEZ DEPO', stock: '110.00' },
    { store_id: 9, name: 'GAZCILAR MAĞAZA', stock: '30.00' },
    { store_id: 10, name: 'İHSANİYE MAĞAZA', stock: '70.00' },
    { store_id: 13, name: 'KORUPARK AVM MAĞAZA', stock: '50.00' },
    { store_id: 21, name: 'SURYAPI AVM MAĞAZA', stock: '30.00' },
    { store_id: 22, name: 'F.S.M MAĞAZA', stock: '20.00' },
    { store_id: 24, name: 'GÖRÜKLE MAĞAZA', stock: '50.00' },
    { store_id: 29, name: 'DOWNTOWN MAĞAZA', stock: '30.00' },
    { store_id: 33, name: 'KESTEL MAĞAZA', stock: '20.00' },
    { store_id: 35, name: 'KENTMEYDANI AVM MAĞAZA', stock: '40.00' },
    { store_id: 36, name: 'ZAFER AVM MAĞAZA', stock: '40.00' },
    { store_id: 40, name: 'NETTECH ANATOLİUM', stock: '10.00' },
  ],
  weight: '0',
  features: [
    { name: 'Malzeme Cinsi', value: 'Kauçuk' },
    { name: 'Suya Dayanıklılık', value: 'Evet' },
    { name: 'Kullanım Tipi', value: 'Orta Boy Kraft Çanta' },
    { name: 'Ürün Durumu', value: 'Sıfır' },
    { name: 'Ürün Menşei/Ülke', value: 'P.R.C' },
    { name: 'Ekran', value: 'Yok' },
  ],
  compatible_models: [],
  sales_total: 0,
  price1: 15,
  price1_cur: 'TL',
  price2: 0.35,
  price2_cur: 'USD',
  price5: 20,
  price5_cur: 'TL',
  price6: 13,
  price6_cur: 'TL',
  price8: 18,
  price8_cur: 'TL',
};
