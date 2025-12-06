import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3a79c5b3de4b4f99a333d2016c349687',
  appName: 'PaperTrade Options',
  webDir: 'dist',
  server: {
    url: 'https://3a79c5b3-de4b-4f99-a333-d2016c349687.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
