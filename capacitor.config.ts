import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.kingdomnotes.app',
  appName: 'Kingdom Notes',
  webDir: 'out',
  
  // Server configuration for development
  server: {
    // For production, this should be your deployed Vercel URL
    url: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : undefined,
    cleartext: true,
  },

  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Kingdom Notes',
    backgroundColor: '#0f1729',
  },

  // Android specific configuration (if you want to deploy there too)
  android: {
    backgroundColor: '#0f1729',
  },

  // Plugins configuration
  plugins: {
    // Splash screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f1729',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Status bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f1729',
    },

    // Keyboard
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },

    // Push notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Haptics for game feedback
    Haptics: {},
  },
}

export default config
