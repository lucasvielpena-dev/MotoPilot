import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucasviel.appmoto',
  appName: 'MotoPilot',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.13:3000',
    cleartext: true
  },
  android: {
    useLegacyBridge: true
  },
  plugins: {
    BackgroundGeolocation: {
      backgroundTitle: 'MotoPilot',
      backgroundMessage: 'Sua jornada está ativa e os km continuam sendo marcados.',
      requestPermissions: true,
      stale: false,
      distanceFilter: 5,
      pauseLocationUpdates: false,
      disableStopDetection: true
    }
  }
};

export default config;
