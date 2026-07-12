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
  }
};

export default config;
