# 🐛 Debug Rehberi - Nettech API Entegrasyonu

## 📊 Console Logları Nasıl Görülür

### ✅ En Kolay Yöntem: Metro Bundler Terminal

Uygulamayı çalıştırdığınızda Metro Bundler otomatik olarak başlar ve **TÜM console.log çıktılarını gösterir**.

```bash
# Uygulamayı başlat
npm start

# Ayrı terminalde Android çalıştır
npm run android
# veya iOS
npm run ios
```

Metro Bundler terminalinde şu tür loglar göreceksiniz:

```
🚀 Auth başlatılıyor...
ℹ️ Kayıtlı token bulunamadı
Auth başlatma tamamlandı

📱 WEBVIEW MESSAGE ============
📨 Type: AUTH_TOKEN
📦 Data: { "token": "...", "user": {...} }

🔐 TOKEN OPERATION ============
🎯 Action: SET_TOKEN
🎫 Token: eyJhbGciO...W5ldGVjaA
✅ Token başarıyla kaydedildi

🚀 API REQUEST ================
📍 GET https://nettechservis.com/api/user/profile
📋 Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGc..."
}
================================

✅ API RESPONSE ==============
📍 GET https://nettechservis.com/api/user/profile
🔢 Status: 200
📦 Response: {
  "id": "123",
  "name": "Kullanıcı Adı",
  "email": "user@example.com"
}
================================
```

---

## 🔍 Log Kategorileri

### 1. 🚀 API Request Logs
```
🚀 API REQUEST ================
📍 GET/POST/PUT/DELETE https://nettechservis.com/api/endpoint
📦 Data: { ... }           # POST/PUT için gönderilen data
📋 Headers: { ... }        # Authorization token dahil
================================
```

### 2. ✅ API Response Logs
```
✅ API RESPONSE ==============
📍 GET https://nettechservis.com/api/endpoint
🔢 Status: 200
📦 Response: { ... }
================================
```

### 3. ❌ API Error Logs
```
❌ API ERROR ==================
📍 GET https://nettechservis.com/api/endpoint
💥 Error: Network request failed
================================
```

### 4. 🔐 Token Operation Logs
```
🔐 TOKEN OPERATION ============
🎯 Action: SET_TOKEN
🎫 Token: eyJhbGciO...W5ldGVjaA    # Güvenlik için sadece ilk ve son 10 karakter
================================

✅ Token başarıyla kaydedildi
```

### 5. 📱 WebView Message Logs
```
📱 WEBVIEW MESSAGE ============
📨 Type: AUTH_TOKEN
📦 Data: {
  "type": "AUTH_TOKEN",
  "token": "jwt_token_here",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "Kullanıcı Adı"
  }
}
================================
```

### 6. 🔒 Auth State Change Logs
```
🔒 AUTH STATE CHANGE ==========
🎯 Action: SET_AUTH_TOKEN
👤 User: {
  "id": "123",
  "email": "user@example.com",
  "name": "Kullanıcı Adı"
}
================================
```

---

## 🎯 Test Senaryosu

### Senaryo 1: İlk Uygulama Açılışı

Metro Bundler'da göreceğiniz loglar:

```
🚀 Auth başlatılıyor...
ℹ️ Kayıtlı token bulunamadı
Auth başlatma tamamlandı
```

**Anlamı**: Uygulama ilk kez açılıyor, kayıtlı token yok.

---

### Senaryo 2: WebView'dan Login

Web projesinde login yaptığınızda göreceğiniz loglar:

```
📱 WEBVIEW MESSAGE ============
📨 Type: AUTH_TOKEN
📦 Data: {
  "type": "AUTH_TOKEN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "Test User"
  }
}
================================

ℹ️  WebView'dan token alındı, kaydediliyor...

🔒 AUTH STATE CHANGE ==========
🎯 Action: SET_AUTH_TOKEN
👤 User: {
  "id": "123",
  "email": "user@example.com",
  "name": "Test User"
}
================================

🔐 TOKEN OPERATION ============
🎯 Action: SET_TOKEN
🎫 Token: eyJhbGciOi...yJXVCJ9
================================

✅ Token başarıyla kaydedildi

✅ Auth token ve user data başarıyla kaydedildi

✅ Token ve kullanıcı bilgisi başarıyla kaydedildi!
```

**Anlamı**:
1. WebView'dan token mesajı alındı
2. Token ve user bilgisi AsyncStorage'a kaydedildi
3. AuthContext güncellendi
4. Artık authenticated durumdasınız!

---

### Senaryo 3: ProfileScreen'de API İsteği

Profile sekmesine geçtiğinizde göreceğiniz loglar:

```
🚀 API REQUEST ================
📍 GET https://nettechservis.com/api/user/profile
📋 Headers: {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
================================

✅ API RESPONSE ==============
📍 GET https://nettechservis.com/api/user/profile
🔢 Status: 200
📦 Response: {
  "id": "123",
  "email": "user@example.com",
  "name": "Test User",
  "role": "admin"
}
================================
```

**Anlamı**:
1. GET request gönderildi
2. Authorization header'ında token var
3. API 200 (başarılı) döndü
4. User bilgisi alındı

---

### Senaryo 4: API Hatası (401 Unauthorized)

Token geçersizse göreceğiniz loglar:

```
🚀 API REQUEST ================
📍 GET https://nettechservis.com/api/user/profile
📋 Headers: {
  "Authorization": "Bearer invalid_token"
}
================================

❌ API RESPONSE ==============
📍 GET https://nettechservis.com/api/user/profile
🔢 Status: 401
📦 Response: {
  "error": "Unauthorized"
}
================================

🔐 TOKEN OPERATION ============
🎯 Action: CLEAR_TOKENS
================================

✅ Tüm tokenlar temizlendi
```

**Anlamı**: Token geçersiz, otomatik olarak temizlendi.

---

### Senaryo 5: Network Hatası

İnternet bağlantısı yoksa:

```
🚀 API REQUEST ================
📍 GET https://nettechservis.com/api/user/profile
================================

❌ API ERROR ==================
📍 GET https://nettechservis.com/api/user/profile
💥 Error: Network request failed
================================
```

**Anlamı**: İnternet bağlantısı yok veya API'ye erişilemiyor.

---

## 🔧 iOS AsyncStorage Hatası Çözümü

Resimdeki hata: `[RNCA/AsyncStorage]: NativeModule: AsyncStorage is null`

### Çözüm 1: CocoaPods Yükle ve Pod Install

```bash
# 1. CocoaPods yükle (eğer yoksa)
sudo gem install cocoapods

# 2. iOS podlarını yükle
cd ios
pod install
cd ..

# 3. iOS'u yeniden başlat
npm run ios
```

### Çözüm 2: Clean ve Rebuild

```bash
# iOS build'i tamamen temizle
cd ios
rm -rf Pods Podfile.lock build
pod install
cd ..

# Metro cache'i temizle
npm start -- --reset-cache

# Ayrı terminalde iOS'u başlat
npm run ios
```

### Çözüm 3: Xcode'da Manuel Build

```bash
# Xcode ile aç
open ios/Nettech.xcworkspace

# Xcode'da:
# 1. Product > Clean Build Folder
# 2. Product > Build
# 3. Product > Run
```

---

## 🎬 Başlangıç Komutları

```bash
# Terminal 1: Metro Bundler (buradan logları göreceksiniz)
npm start

# Terminal 2: Android
npm run android

# veya iOS
npm run ios
```

---

## 🐛 Sorun Giderme

### "Token kaydedildi ama API isteği gitmiyor"

Kontrol listesi:
1. ✅ Metro Bundler'da "🔐 TOKEN OPERATION" logu var mı?
2. ✅ "🚀 API REQUEST" logu var mı?
3. ✅ Authorization header'ında token var mı?
4. ✅ API URL doğru mu? `https://nettechservis.com/api/user/profile`

### "WebView'dan token gelmiyor"

Kontrol listesi:
1. ✅ Web projesinde `window.ReactNativeWebView.postMessage()` çağrılıyor mu?
2. ✅ Metro Bundler'da "📱 WEBVIEW MESSAGE" logu var mı?
3. ✅ Message formatı doğru mu? `{type: 'AUTH_TOKEN', token: '...', user: {...}}`

### "API 401 döndürüyor"

Kontrol listesi:
1. ✅ Token geçerli mi?
2. ✅ Authorization header formatı: `Bearer {token}`
3. ✅ API endpoint'i doğru mu?
4. ✅ Backend'de token validation çalışıyor mu?

---

## 📞 Yardım

Sorun yaşıyorsanız:
1. Metro Bundler console'unu screenshot alın
2. Hangi adımda takıldığınızı belirtin
3. Hata mesajını paylaşın

---

## ✅ Başarılı Entegrasyon Kontrol Listesi

- [ ] Metro Bundler başarıyla çalışıyor
- [ ] "🚀 Auth başlatılıyor..." logu görünüyor
- [ ] WebView'da login yapılabiliyor
- [ ] "📱 WEBVIEW MESSAGE" logu görünüyor
- [ ] "🔐 TOKEN OPERATION" logu görünüyor
- [ ] "✅ Token başarıyla kaydedildi" logu görünüyor
- [ ] ProfileScreen'e geçildiğinde "🚀 API REQUEST" logu görünüyor
- [ ] API'den başarılı response geliyor (✅ API RESPONSE, Status: 200)
- [ ] ProfileScreen'de kullanıcı bilgileri görünüyor
- [ ] Çıkış yap butonu çalışıyor

Hepsi ✅ ise entegrasyon başarılı!
