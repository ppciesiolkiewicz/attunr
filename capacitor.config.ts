import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.attunr.www',
  appName: 'attunr',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    appStartPath: '/journey/',
  },
  ios: {
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#080810',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#080810',
    },
  },
};

export default config;
