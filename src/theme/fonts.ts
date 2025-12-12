import { Platform } from 'react-native';

// Public Sans font ailesi
// iOS ve Android için font isimleri aynı (dosya adından .ttf uzantısı çıkarılmış hali)
const fonts = {
  thin: 'PublicSans-Thin',
  light: 'PublicSans-Light',
  regular: 'PublicSans-Regular',
  medium: 'PublicSans-Medium',
  semiBold: 'PublicSans-SemiBold',
  bold: 'PublicSans-Bold',
  extraBold: 'PublicSans-ExtraBold',
};

// Font weight eşleştirmesi
// React Native fontWeight değerlerini Public Sans varyantlarına eşleştir
export const getFontFamily = (weight?: string): string => {
  switch (weight) {
    case '100':
    case '200':
      return fonts.thin;
    case '300':
      return fonts.light;
    case '400':
    case 'normal':
      return fonts.regular;
    case '500':
      return fonts.medium;
    case '600':
      return fonts.semiBold;
    case '700':
    case 'bold':
      return fonts.bold;
    case '800':
    case '900':
      return fonts.extraBold;
    default:
      return fonts.regular;
  }
};

// Varsayılan font stili
export const fontFamily = fonts.regular;

// Tüm fontlar
export default fonts;
