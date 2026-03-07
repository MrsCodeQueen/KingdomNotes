# Kingdom Notes - iOS App Store Deployment Guide

## Prerequisites

1. **Apple Developer Account** - You have this already
2. **Xcode** - Install from the Mac App Store (requires macOS)
3. **Node.js 18+** and **pnpm** installed
4. **CocoaPods** - Install via `sudo gem install cocoapods`

## Step 1: Initial Setup

```bash
# Install dependencies
pnpm install

# Initialize Capacitor iOS platform
pnpm cap:add:ios
```

## Step 2: Configure App Icons

After adding iOS, you'll find the Xcode project at `ios/App/App.xcworkspace`.

1. Open the project in Xcode
2. Navigate to `App > Assets.xcassets > AppIcon`
3. Add your app icons in all required sizes (use an icon generator like [AppIcon.co](https://appicon.co))

Use the generated `public/icon-512.png` as your source image.

## Step 3: Configure Splash Screen

1. In Xcode, go to `App > Assets.xcassets`
2. Add a `Splash` image set with your splash screen design
3. Or edit `ios/App/App/LaunchScreen.storyboard` directly

## Step 4: Update Bundle Identifier

1. In Xcode, select the "App" target
2. Go to "Signing & Capabilities"
3. Update the Bundle Identifier to match your App Store Connect app (e.g., `com.yourcompany.kingdomnotes`)
4. Sign in with your Apple Developer account
5. Select your Team

## Step 5: Build for Production

```bash
# Set environment variable for static export
export CAPACITOR_BUILD=true

# Build and sync
pnpm build:ios
```

This will:
1. Build the Next.js app as static files
2. Sync the files to the iOS project
3. Open Xcode

## Step 6: Configure in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with:
   - **Name**: Kingdom Notes
   - **Primary Language**: English
   - **Bundle ID**: com.kingdomnotes.app (or your chosen ID)
   - **SKU**: kingdom-notes-001

3. Fill in the required information:
   - Description
   - Keywords
   - Support URL
   - Screenshots (required sizes: 6.7", 6.5", 5.5" iPhones and iPads)
   - App Icon (1024x1024 without alpha)
   - Age Rating
   - Privacy Policy URL

## Step 7: Archive and Upload

1. In Xcode, select "Any iOS Device" as the build target
2. Go to **Product > Archive**
3. Once archived, click **Distribute App**
4. Select **App Store Connect** > **Upload**
5. Follow the prompts

## Step 8: Submit for Review

1. In App Store Connect, go to your app
2. Add build (it will appear after processing, ~15-30 min)
3. Fill in "What's New" notes
4. Submit for Review

## App Store Guidelines Notes

For Kingdom Notes, be aware of:

- **In-App Purchases**: If you add premium features, use Apple's IAP
- **User Data**: Ensure privacy policy covers game data collection
- **Religious Content**: Gospel theme is fine, just avoid controversial claims
- **Gambling**: Make sure the game mechanics don't constitute gambling

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
cd ios/App
pod deintegrate
pod install
cd ../..
pnpm cap:sync
```

### Signing Issues

- Ensure your Apple Developer membership is active
- Check that the Bundle ID matches exactly in Xcode and App Store Connect
- Try resetting signing certificates in Xcode Preferences > Accounts

### API Connection Issues

The app connects to your Vercel deployment for the backend. Ensure:
1. Your Vercel app is deployed and accessible
2. The URLs in the app point to your production domain
3. CORS is properly configured

## Updating the App

For future updates:

```bash
export CAPACITOR_BUILD=true
pnpm build:static
pnpm cap:sync
# Then archive and upload in Xcode
```

## Support

For Capacitor-specific issues: https://capacitorjs.com/docs
For App Store submission help: https://developer.apple.com/app-store/review/guidelines/
