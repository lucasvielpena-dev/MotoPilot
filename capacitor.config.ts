import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucasviel.appmoto',
  appName: 'MotoPilot',
  webDir: 'out',
  android: {
    useLegacyBridge: true
  }
};

export default config;
