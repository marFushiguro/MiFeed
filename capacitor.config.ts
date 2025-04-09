import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.marbe.appFeed',
  appName: 'app_feed',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'], // Esto activa las notificaciones en el frontend
    },
  },
};

export default config;
