import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucasviel.appmoto',
  appName: 'MotoPilot',
  webDir: 'out', // Next.js utiliza a pasta 'out' para builds estáticos exportados
  server: {
    // Para apontar para a Vercel durante testes ou usar a versão online
    // url: 'https://seu-app-na-vercel.vercel.app',
    // cleartext: true
  }
};

export default config;
