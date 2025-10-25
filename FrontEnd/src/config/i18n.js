import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

// Cấu hình i18next
i18n
  .use(initReactI18next) // kết nối với React
  .init({
    resources: {
      vi: {
        translation: vi
      },
      en: {
        translation: en
      }
    },
    lng: localStorage.getItem('language') || 'en', // ngôn ngữ mặc định
    fallbackLng: 'en', // ngôn ngữ dự phòng nếu không tìm thấy
    interpolation: {
      escapeValue: false // React đã tự động escape
    }
  });

export default i18n;
