import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leastcountapp.app',
  appName: 'Least Count App',
  webDir: 'www',
  server: {
    url: 'https://leastcountapp.com',
    cleartext: false,
  },
};

export default config;
