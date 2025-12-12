import tokenManager from '../api/client/tokenManager';

// API Base URL
const API_BASE_URL = 'https://nettechservis.com/api';

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

export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  variations?: T[];
  error?: string;
}

/**
 * Barkod ile ürün bilgisi getirir
 * @param barcode - Ürün barkodu
 * @returns Product bilgisi
 */
export async function findProductByBarcode(
  barcode: string,
): Promise<ApiResponse<Product>> {
  const url = `${API_BASE_URL}/product/find/${barcode}`;

  // Token'ı al
  const token = await tokenManager.getToken();

  // Timeout kontrolü için AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Token varsa Authorization header'ına ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 [findProductByBarcode] REQUEST:', {
      url,
      method: 'GET',
      headers: { ...headers, Authorization: token ? 'Bearer ***' : undefined },
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Response text'i al
    const responseText = await response.text();

    console.log('📥 [findProductByBarcode] RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      bodyLength: responseText.length,
      body:
        responseText.substring(0, 500) +
        (responseText.length > 500 ? '...' : ''),
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // JSON parse et
    let apiResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('Response was:', responseText);
      throw new Error('API yanıtı JSON formatında değil');
    }

    // API'den dönen veriyi kontrol et - variations dizisini kontrol et
    let productsArray = [];

    if (
      apiResponse.variations &&
      Array.isArray(apiResponse.variations) &&
      apiResponse.variations.length > 0
    ) {
      // Yeni format: variations dizisi
      productsArray = apiResponse.variations;
    } else if (apiResponse.success && apiResponse.product) {
      // Eski format için fallback
      productsArray = [apiResponse.product];
    } else {
      throw new Error('API yanıtında product bilgisi bulunamadı');
    }

    // Helper function: Product'ı formatla
    const formatProduct = (product: any): Product => {
      // storeStocks bilgisini kontrol et ve oluştur
      const storeStocks =
        product.storeStocks && Array.isArray(product.storeStocks)
          ? product.storeStocks.map((s: any) => ({
              store_id: s.store_id || 0,
              name: s.name || s.store_name || '',
              stock: String(s.stock || 0),
            }))
          : product.shelf && Array.isArray(product.shelf)
          ? product.shelf.map((s: any) => ({
              store_id: s.store_id || 0,
              name: s.name || s.store_name || '',
              stock: String(s.stock || 0),
            }))
          : [];

      // features bilgisini kontrol et ve oluştur - Object'i Array'e çevir
      let features: ProductFeature[] = [];
      if (product.features) {
        if (Array.isArray(product.features)) {
          features = product.features;
        } else if (typeof product.features === 'object') {
          // Object ise array'e çevir
          features = Object.values(product.features);
        }
      }

      return {
        id: product.id,
        category_id: product.category_id,
        name: product.name,
        barcode: product.barcode,
        coverUrlThumb: product.coverUrlThumb
          ? `https://nettechservis.com${product.coverUrlThumb}`
          : '',
        totalStock: product.totalStock || 0,
        storeStocks: storeStocks,
        weight: product.weight || '0',
        features: features,
        compatible_models:
          product.compatible_models || product.compatible_model_values || [],
        sales_total: product.sales_total || 0,
        price1: product.price1,
        price1_cur: product.price1_cur,
        price2: product.price2,
        price2_cur: product.price2_cur,
        price5: product.price5,
        price5_cur: product.price5_cur,
        price6: product.price6,
        price6_cur: product.price6_cur,
        price8: product.price8,
        price8_cur: product.price8_cur,
      };
    };

    // Tüm ürünleri formatla
    const formattedProducts = productsArray.map(formatProduct);

    return {
      success: true,
      data: formattedProducts[0], // İlk varyant default
      variations: formattedProducts, // Tüm varyantlar
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Product fetch error:', error);

    // AbortError durumunu kontrol et
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'İstek zaman aşımına uğradı (10 saniye)',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ürün bulunamadı',
    };
  }
}

/**
 * Ürün ID'sini barkod ile nettechservis'e gönderir
 * @param barcode - Ürün barkodu
 * @param productId - Ürün ID'si
 * @returns Formatlanmış Product bilgisi ile API yanıtı
 */
export async function sendProductIdToService(
  barcode: string,
  productId: number,
): Promise<ApiResponse<Product>> {
  const url = 'https://nettechservis.com/barcode_product';

  // Token'ı al
  const token = await tokenManager.getToken();

  // Timeout kontrolü için AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Token varsa Authorization header'ına ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      product_id: productId,
    };

    console.log('📤 [sendProductIdToService] REQUEST:', {
      url,
      method: 'POST',
      headers: { ...headers, Authorization: token ? 'Bearer ***' : undefined },
      body: requestBody,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Response text'i al
    const responseText = await response.text();

    console.log('📥 [sendProductIdToService] RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      body:
        responseText.substring(0, 500) +
        (responseText.length > 500 ? '...' : ''),
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // JSON parse et
    let apiResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      throw new Error('Service response JSON değil');
    }

    // Variations formatından Product objesi oluştur
    if (
      apiResponse.variations &&
      Array.isArray(apiResponse.variations) &&
      apiResponse.variations.length > 0
    ) {
      // Helper function: Product'ı formatla (findProductByBarcode'dakiyle aynı)
      const formatProduct = (product: any): Product => {
        // storeStocks bilgisini kontrol et ve oluştur
        const storeStocks =
          product.storeStocks && Array.isArray(product.storeStocks)
            ? product.storeStocks.map((s: any) => ({
                store_id: s.store_id || 0,
                name: s.name || s.store_name || '',
                stock: String(s.stock || 0),
              }))
            : [];

        // features bilgisini kontrol et ve oluştur - Object'i Array'e çevir
        let features: ProductFeature[] = [];
        if (product.features) {
          if (Array.isArray(product.features)) {
            features = product.features;
          } else if (typeof product.features === 'object') {
            // Object ise array'e çevir
            features = Object.values(product.features);
          }
        }

        return {
          id: product.id,
          category_id: product.category_id,
          name: product.name,
          barcode: product.barcode,
          coverUrlThumb: product.coverUrlThumb
            ? `https://nettechservis.com${product.coverUrlThumb}`
            : '',
          totalStock: product.totalStock || 0,
          storeStocks: storeStocks,
          weight: product.weight || '0',
          features: features,
          compatible_models: product.compatible_models || [],
          sales_total: product.sales_total || 0,
          price1: product.price1,
          price1_cur: product.price1_cur,
          price2: product.price2,
          price2_cur: product.price2_cur,
          price5: product.price5,
          price5_cur: product.price5_cur,
          price6: product.price6,
          price6_cur: product.price6_cur,
          price8: product.price8,
          price8_cur: product.price8_cur,
        };
      };

      // Tüm ürünleri formatla
      const formattedProducts = apiResponse.variations.map(formatProduct);

      return {
        success: true,
        data: formattedProducts[0], // İlk varyant default
        variations: formattedProducts, // Tüm varyantlar
      };
    } else {
      throw new Error('Service response variations bulunamadı');
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Send Product ID error:', error);

    // AbortError durumunu kontrol et
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'İstek zaman aşımına uğradı (10 saniye)',
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Product ID gönderilemedi',
    };
  }
}

/**
 * Ürün arama - query ile ürün listesi getirir
 * @param query - Arama metni
 * @param page - Sayfa numarası (default: 1)
 * @returns Ürün listesi
 */
export async function searchProducts(
  query: string,
  page: number = 1,
): Promise<ApiResponse<Product[]>> {
  const url = `${API_BASE_URL}/products`;

  // Token'ı al
  const token = await tokenManager.getToken();

  console.log(
    '🔑 [searchProducts] Token alındı:',
    token ? `Var (${token.substring(0, 20)}...)` : 'YOK!',
  );

  // Timeout kontrolü için AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Token varsa Authorization header'ına ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      page: page,
      search: query,
      orderingBy: 'id',
      orderDirection: 'desc',
      itemsPerPage: 50,
      filters: {
        stockStatus: ['active:1'],
        search_compatibles: true,
        by_store_stock: false,
        store_stock_limit: 1,
      },
    };

    console.log('📤 [searchProducts] REQUEST:', {
      url,
      method: 'POST',
      headers: {
        'Content-Type': headers['Content-Type'],
        Accept: headers['Accept'],
        Authorization: headers['Authorization']
          ? `Bearer ${headers['Authorization'].substring(7, 27)}...`
          : 'YOK!',
      },
      body: requestBody,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Response text'i al
    const responseText = await response.text();

    console.log('📥 [searchProducts] RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      bodyLength: responseText.length,
      body:
        responseText.substring(0, 500) +
        (responseText.length > 500 ? '...' : ''),
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // JSON parse et
    let apiResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('Response was:', responseText);
      throw new Error('API yanıtı JSON formatında değil');
    }

    // API'den dönen ürünleri formatla
    const products: Product[] = [];

    // Response'dan data array'ini al
    const dataArray = apiResponse.data || apiResponse.variations;

    if (dataArray && Array.isArray(dataArray)) {
      console.log(`✅ [searchProducts] ${dataArray.length} ürün bulundu`);

      dataArray.forEach((product: any) => {
        // storeStocks bilgisini kontrol et ve oluştur
        const storeStocks =
          product.storeStocks && Array.isArray(product.storeStocks)
            ? product.storeStocks.map((s: any) => ({
                store_id: s.store_id || 0,
                name: s.name || s.store_name || '',
                stock: String(s.stock || 0),
              }))
            : product.shelf && Array.isArray(product.shelf)
            ? product.shelf.map((s: any) => ({
                store_id: s.store_id || 0,
                name: s.name || s.store_name || '',
                stock: String(s.stock || 0),
              }))
            : [];

        // features bilgisini kontrol et ve oluştur
        const features =
          product.features && Array.isArray(product.features)
            ? product.features
            : [];

        // Product verisini formatla
        const formattedProduct: Product = {
          id: product.id,
          category_id: product.category_id,
          name: product.name,
          barcode: product.barcode,
          coverUrlThumb: product.coverUrlThumb
            ? `https://nettechservis.com${product.coverUrlThumb}`
            : '',
          totalStock: product.totalStock || 0,
          storeStocks: storeStocks,
          weight: product.weight || '0',
          features: features,
          compatible_models:
            product.compatible_models || product.compatible_model_values || [],
          sales_total: product.sales_total || 0,
          price1: product.price1,
          price1_cur: product.price1_cur,
          price2: product.price2,
          price2_cur: product.price2_cur,
          price5: product.price5,
          price5_cur: product.price5_cur,
          price6: product.price6,
          price6_cur: product.price6_cur,
          price8: product.price8,
          price8_cur: product.price8_cur,
        };

        products.push(formattedProduct);
      });
    } else {
      console.log("⚠️ [searchProducts] Response'da data array bulunamadı");
    }

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Product search error:', error);

    // AbortError durumunu kontrol et
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'İstek zaman aşımına uğradı (10 saniye)',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ürün araması başarısız',
    };
  }
}

/**
 * Marka listesini getirir
 * @returns Marka listesi
 */
export async function getBrands(): Promise<ApiResponse<Brand[]>> {
  const url = `${API_BASE_URL}/product/brands`;

  // Token'ı al
  const token = await tokenManager.getToken();

  // Timeout kontrolü için AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Token varsa Authorization header'ına ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 [getBrands] REQUEST:', {
      url,
      method: 'POST',
      headers: { ...headers, Authorization: token ? 'Bearer ***' : undefined },
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    console.log('📥 [getBrands] RESPONSE:', {
      status: response.status,
      bodyLength: responseText.length,
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let apiResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      throw new Error('API yanıtı JSON formatında değil');
    }

    // Debug: API yanıtının yapısını kontrol et
    console.log('🔍 [getBrands] API Response keys:', Object.keys(apiResponse));
    console.log(
      '🔍 [getBrands] API Response sample:',
      JSON.stringify(apiResponse).substring(0, 500),
    );

    // Brands array'ini al - Farklı olası key'leri kontrol et
    let brands: Brand[] = [];

    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      brands = apiResponse.data;
    } else if (apiResponse.brands && Array.isArray(apiResponse.brands)) {
      brands = apiResponse.brands;
    } else if (Array.isArray(apiResponse)) {
      // Response'un kendisi array olabilir
      brands = apiResponse;
    } else if (apiResponse.result && Array.isArray(apiResponse.result)) {
      brands = apiResponse.result;
    }

    console.log(`✅ [getBrands] ${brands.length} marka bulundu`);

    return {
      success: true,
      data: brands,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Brands fetch error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'İstek zaman aşımına uğradı (10 saniye)',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Marka listesi alınamadı',
    };
  }
}

/**
 * Kategori listesini getirir
 * @returns Kategori listesi
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const url = `${API_BASE_URL}/product/categories-for-select`;

  // Token'ı al
  const token = await tokenManager.getToken();

  // Timeout kontrolü için AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Token varsa Authorization header'ına ekle
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 [getCategories] REQUEST:', {
      url,
      method: 'POST',
      headers: { ...headers, Authorization: token ? 'Bearer ***' : undefined },
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    console.log('📥 [getCategories] RESPONSE:', {
      status: response.status,
      bodyLength: responseText.length,
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let apiResponse;
    try {
      apiResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      throw new Error('API yanıtı JSON formatında değil');
    }

    // Debug: API yanıtının yapısını kontrol et
    console.log(
      '🔍 [getCategories] API Response keys:',
      Object.keys(apiResponse),
    );
    console.log(
      '🔍 [getCategories] API Response sample:',
      JSON.stringify(apiResponse).substring(0, 500),
    );

    // Categories array'ini al - Farklı olası key'leri kontrol et
    let categories: Category[] = [];

    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      categories = apiResponse.data;
    } else if (
      apiResponse.categories &&
      Array.isArray(apiResponse.categories)
    ) {
      categories = apiResponse.categories;
    } else if (Array.isArray(apiResponse)) {
      // Response'un kendisi array olabilir
      categories = apiResponse;
    } else if (apiResponse.result && Array.isArray(apiResponse.result)) {
      categories = apiResponse.result;
    }

    console.log(`✅ [getCategories] ${categories.length} kategori bulundu`);

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Categories fetch error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'İstek zaman aşımına uğradı (10 saniye)',
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Kategori listesi alınamadı',
    };
  }
}

/**
 * Ürün için feedback gönder
 */
export async function sendFeedback(
  barcode: string,
  type: 'Expensive' | 'Cheap' | 'Other',
  text: string = '',
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await tokenManager.getToken();

    if (!token) {
      return {
        success: false,
        error: 'Oturum bulunamadı',
      };
    }

    const response = await fetch(
      `https://nettechservis.com/barcode/${barcode}/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, text }),
      },
    );

    if (!response.ok) {
      throw new Error('Feedback gönderilemedi');
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Feedback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Feedback gönderilemedi',
    };
  }
}

/**
 * API base URL'i döndürür
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
