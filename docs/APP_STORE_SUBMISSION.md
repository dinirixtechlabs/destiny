# destiny — Amazon Appstore Submission Guide

This document covers the complete process for submitting the destiny Passenger App and Driver App to the Amazon Appstore.

---

## Table of Contents

- [1. Pre-Submission Checklist](#1-pre-submission-checklist)
- [2. Amazon Developer Account Setup](#2-amazon-developer-account-setup)
- [3. Required Assets](#3-required-assets)
- [4. Passenger App — Listing Info](#4-passenger-app--listing-info)
- [5. Driver App — Listing Info](#5-driver-app--listing-info)
- [6. Privacy Policy](#6-privacy-policy)
- [7. Content Rating Questionnaire](#7-content-rating-questionnaire)
- [8. Release Build with Expo (EAS Build)](#8-release-build-with-expo-eas-build)
- [9. Step-by-Step Submission Process](#9-step-by-step-submission-process)
- [10. Post-Submission](#10-post-submission)

---

## 1. Pre-Submission Checklist

Complete all items before starting the submission process.

### General

- [ ] Amazon Developer Account created and verified
- [ ] Both apps fully tested on physical Android devices
- [ ] All APIs working on production backend (not localhost)
- [ ] Production backend URL configured in both apps
- [ ] No console.log / debug statements in production code
- [ ] App icons and splash screens finalized
- [ ] Privacy policy hosted at a public URL

### Passenger App

- [ ] Register, Login, Logout work correctly
- [ ] Map loads and shows current location
- [ ] Fare estimation returns correct results
- [ ] Full ride flow works end-to-end
- [ ] Rating submission works
- [ ] Ride history displays correctly
- [ ] Profile view and edit work
- [ ] Error handling for network failures
- [ ] Loading indicators on all API calls
- [ ] App handles location permission denial gracefully

### Driver App

- [ ] Register, Login, Logout work correctly
- [ ] Pending approval screen shows for unapproved drivers
- [ ] Online/Offline toggle works
- [ ] Ride request popup appears and has accept/reject
- [ ] Active ride status progression works (all states)
- [ ] Earnings screen shows correct data
- [ ] Vehicle management (add, edit, delete) works
- [ ] GPS location updates while online
- [ ] App handles location permission denial gracefully

### Technical

- [ ] `app.json` configured with correct app name, slug, version
- [ ] App version set (e.g., `1.0.0`)
- [ ] Android `package` name set (e.g., `com.destiny.passenger`)
- [ ] EAS Build configured and working
- [ ] Release APK/AAB built and tested
- [ ] App size is reasonable (< 100 MB recommended)
- [ ] `expo-location` permissions declared in `app.json`
- [ ] Internet permission declared

---

## 2. Amazon Developer Account Setup

1. Go to [https://developer.amazon.com](https://developer.amazon.com)
2. Click "Sign In" or "Create Account"
3. Fill in developer profile:
   - Developer name
   - Contact email
   - Address
4. Accept the Amazon Appstore Distribution Agreement
5. No annual fee for Amazon Appstore (unlike Google Play)
6. Navigate to the **Amazon Appstore Console** → "Add New App"

---

## 3. Required Assets

### 3.1 App Icons

| Asset | Size | Format | Notes |
|---|---|---|---|
| App Icon (required) | 512 × 512 px | PNG (32-bit, no alpha) | Main store listing icon |
| Small Icon | 114 × 114 px | PNG | Used on device |

**Design Guidelines:**
- Use the destiny logo/brand mark
- Solid background (no transparency)
- No rounded corners (Amazon applies its own)
- Passenger App: use a rider/car icon variant
- Driver App: use a steering wheel/driver icon variant to differentiate

### 3.2 Screenshots

Amazon requires **3 to 10 screenshots** per app.

| Screenshot | Resolution | Notes |
|---|---|---|
| Phone Screenshots | 1080 × 1920 px (or 16:9 ratio) | Min 3, max 10 |
| Tablet Screenshots | 1200 × 1920 px or 1920 × 1200 px | Optional but recommended |

**Recommended Screenshots (Passenger App):**

1. Home screen with map
2. Destination selection / fare estimate
3. Ride tracking with driver info
4. Rating screen
5. Ride history

**Recommended Screenshots (Driver App):**

1. Home screen with Online/Offline toggle
2. Ride request popup
3. Active ride with status buttons
4. Earnings screen
5. Vehicle management

**Tips:**
- Use a clean device with a full battery and signal bars
- Remove any debug banners
- Use real-looking test data (not "test123")
- Consider using a screenshot framing tool (e.g., MockUPhone, Frameo)

### 3.3 Feature Graphic (Promotional Image)

| Asset | Size | Format |
|---|---|---|
| Promotional Image | 1024 × 500 px | PNG or JPG |

This is displayed at the top of your app listing. Include:
- destiny logo
- Tagline (e.g., "Your ride, your way")
- Simple illustration of the app in action

---

## 4. Passenger App — Listing Info

### App Details

| Field | Value |
|---|---|
| **App Title** | destiny — Book a Ride |
| **Package Name** | `com.destiny.passenger` |
| **Category** | Maps & Navigation (or Travel & Local) |
| **Content Rating** | Everyone |
| **Default Language** | English |

### Short Description (max 80 chars)

```
Book rides easily with destiny. Fast, reliable, affordable transportation.
```

### Long Description (max 4000 chars)

```
destiny is your go-to ride-booking app for fast, reliable, and affordable
transportation.

Whether you're commuting to work, heading out for the evening, or need a
quick ride across town, destiny connects you with nearby drivers in seconds.

KEY FEATURES:

• Quick Booking — Select your pickup and destination, get an instant fare
  estimate, and book your ride in seconds.

• Live Ride Tracking — Track your driver's location in real time as they
  arrive at your pickup location and throughout your trip.

• Fare Estimates — Know the cost before you ride. Get transparent fare
  estimates based on distance and duration.

• Driver Details — See your assigned driver's name, vehicle details, and
  rating before they arrive.

• Ride History — Access all your past trips, including routes, fares, and
  driver information.

• Rate Your Driver — After each ride, rate your driver and leave feedback
  to help maintain service quality.

• Secure Authentication — Your account is protected with secure login and
  encrypted data handling.

• Profile Management — Manage your account details, phone number, and
  preferences easily.

HOW IT WORKS:

1. Open destiny and allow location access
2. Enter your destination
3. Review the fare estimate
4. Confirm your booking
5. Track your driver in real time
6. Enjoy your ride!
7. Rate your driver after arrival

Download destiny today and experience hassle-free transportation!
```

### Keywords

```
ride booking, taxi, cab, transportation, ride share, book ride, driver,
travel, commute, ride hailing
```

---

## 5. Driver App — Listing Info

### App Details

| Field | Value |
|---|---|
| **App Title** | destiny Driver — Accept Rides |
| **Package Name** | `com.destiny.driver` |
| **Category** | Maps & Navigation (or Business) |
| **Content Rating** | Everyone |
| **Default Language** | English |

### Short Description (max 80 chars)

```
Drive with destiny. Accept ride requests, earn money, manage your schedule.
```

### Long Description (max 4000 chars)

```
destiny Driver is the companion app for drivers on the destiny ride-booking
platform. Accept ride requests, manage your availability, track your
earnings, and grow your driving business.

KEY FEATURES:

• Go Online / Offline — Control your availability with a simple toggle.
  Go online when you're ready to accept rides and offline when you need
  a break.

• Ride Requests — Receive ride requests from nearby passengers with
  pickup location, destination, and estimated fare. Accept or reject
  with a single tap.

• Step-by-Step Ride Management — Progress through each ride status:
  arriving → arrived → start ride → complete ride. Clear, intuitive
  controls at every step.

• Earnings Dashboard — Track your daily and total earnings at a glance.
  See how many rides you've completed and how much you've earned.

• Ride History — View all your past trips with details including
  passenger info, route, fare, and date.

• Vehicle Management — Add and manage your vehicles. Update vehicle
  details including model, number, type, and color.

• Driver Rating — Build your reputation with passenger ratings. See your
  average rating and strive for excellence.

• Secure Authentication — Your account is protected with secure login.
  New driver accounts are reviewed and approved by administrators.

HOW IT WORKS:

1. Register as a driver with your license details
2. Wait for admin approval (we verify your credentials)
3. Once approved, go online to start receiving ride requests
4. Accept a ride request from a nearby passenger
5. Navigate to the pickup location
6. Start the ride and drive to the destination
7. Complete the ride and see your updated earnings

Join destiny as a driver today and start earning!
```

### Keywords

```
driver, ride share driver, earn money, driving, taxi driver, ride accept,
transportation, gig work, cab driver
```

---

## 6. Privacy Policy

Amazon Appstore **requires** a privacy policy URL for all apps.

### Privacy Policy Requirements

Your privacy policy must disclose:

1. **Data Collected:**
   - Full name, email, phone number (registration)
   - GPS / location data (for ride booking and driver tracking)
   - Ride history and transaction data
   - Device information

2. **How Data Is Used:**
   - To provide ride-booking services
   - To connect passengers with drivers
   - To process fare calculations
   - To maintain ride history and earnings
   - To improve the platform

3. **Data Sharing:**
   - Passenger info shared with assigned driver during a ride (name, pickup location)
   - Driver info shared with passenger during a ride (name, vehicle, rating)
   - No data sold to third parties

4. **Data Storage & Security:**
   - Data stored on secured servers (Supabase PostgreSQL)
   - Passwords hashed (never stored in plain text)
   - JWT tokens for secure authentication
   - HTTPS for all API communications

5. **User Rights:**
   - Users can view and update their profile data
   - Users can request account deletion by contacting support

6. **Location Data:**
   - Passenger App: location used to set pickup point and show nearby drivers
   - Driver App: location tracked while online to receive ride requests and during active rides
   - Location is not tracked when the driver is offline or the app is closed

### Hosting the Privacy Policy

Options:
- Host as a page on your website
- Use a free hosting service (GitHub Pages, Notion public page, Google Sites)
- The URL must be publicly accessible (no login required)

Example URL: `https://yourdomain.com/privacy-policy`

---

## 7. Content Rating Questionnaire

Amazon requires you to complete a content rating questionnaire during submission.

### Expected Answers for destiny

| Question | Answer |
|---|---|
| Does the app contain violence? | No |
| Does the app contain sexual content? | No |
| Does the app contain profanity? | No |
| Does the app allow user-generated content? | Yes (reviews/ratings — text only) |
| Does the app share location data? | Yes |
| Does the app require account creation? | Yes |
| Does the app contain advertising? | No |
| Does the app allow in-app purchases? | No |
| Is the app directed at children under 13? | No |
| Does the app access contacts, camera, or microphone? | No |

**Expected Rating Result:** Everyone / All Ages

---

## 8. Release Build with Expo (EAS Build)

### 8.1 Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login
```

### 8.2 Configure EAS for Passenger App

**File: `passenger-app/eas.json`**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {}
}
```

> **Note:** Amazon Appstore accepts APK files. Set `"buildType": "apk"` in your production profile. If you prefer AAB (Android App Bundle), Amazon also supports it but APK is simpler for initial submission.

**File: `passenger-app/app.json`**

```json
{
  "expo": {
    "name": "destiny",
    "slug": "destiny-passenger",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.destiny.passenger",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET"
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "destiny needs your location to set your pickup point and show nearby drivers."
        }
      ]
    ]
  }
}
```

### 8.3 Configure EAS for Driver App

**File: `driver-app/eas.json`**

Same structure as passenger app.

**File: `driver-app/app.json`**

```json
{
  "expo": {
    "name": "destiny Driver",
    "slug": "destiny-driver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.destiny.driver",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "INTERNET"
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "destiny Driver needs your location to receive ride requests and share your position with passengers during active rides.",
          "isAndroidBackgroundLocationEnabled": true
        }
      ]
    ]
  }
}
```

> **Note:** The Driver App requires `ACCESS_BACKGROUND_LOCATION` because the driver's location needs to update while the app may be in the background during active rides.

### 8.4 Build the APKs

```bash
# ── Passenger App ──
cd passenger-app

# Preview build (for testing)
eas build --platform android --profile preview

# Production build (for submission)
eas build --platform android --profile production
```

```bash
# ── Driver App ──
cd driver-app

# Preview build (for testing)
eas build --platform android --profile preview

# Production build (for submission)
eas build --platform android --profile production
```

### 8.5 Download the APKs

After the build completes:

1. Go to [https://expo.dev](https://expo.dev) → your project → Builds
2. Download the `.apk` file for each app
3. **Test the production APK** on a physical device before submitting
4. Verify all features work with the production backend URL

---

## 9. Step-by-Step Submission Process

### 9.1 Submit Passenger App

1. **Login** to [Amazon Developer Console](https://developer.amazon.com/apps-and-games)

2. **Click** "Add New App" → Select "Android"

3. **New App Submission** tab opens with these sections:

#### General Information
   - App title: `destiny — Book a Ride`
   - App SKU: `destiny-passenger-v1` (unique identifier)
   - Category: Maps & Navigation
   - Contact email: your support email
   - Privacy policy URL: `https://yourdomain.com/privacy-policy`

#### Availability & Pricing
   - Base price: Free
   - Available in all countries (or select specific countries)
   - Publish date: As soon as approved

#### Description
   - Short description (paste from Section 4)
   - Long description (paste from Section 4)
   - Keywords (paste from Section 4)

#### Images & Multimedia
   - Upload app icon (512 × 512)
   - Upload screenshots (min 3, recommended 5)
   - Upload promotional image (1024 × 500)

#### Content Rating
   - Complete the questionnaire (see Section 7)

#### Binary File(s)
   - Upload the production APK file
   - Amazon validates the APK (checks package name, version, permissions)
   - Confirm supported devices (phones, tablets, Fire devices)

#### Testing Instructions (for Amazon reviewers)
   ```
   Test Account Credentials:
   
   Email: reviewer@destiny.com
   Password: ReviewerPass123!
   
   Testing Steps:
   1. Login with the above credentials
   2. Allow location permission
   3. Tap "Where to?" and enter any destination address
   4. Review the fare estimate screen
   5. Tap "Confirm Booking" to create a ride
   6. The ride will remain in "Searching for driver" status
      (no real drivers available in test mode)
   7. Navigate to ride history to see past test rides
   8. Check the profile screen
   
   Note: This is a ride-booking platform. Real rides require 
   a driver to be online and accept the request.
   ```

4. **Review** all sections → Click "Submit App"

---

### 9.2 Submit Driver App

Repeat the same process with driver-specific details:

#### General Information
   - App title: `destiny Driver — Accept Rides`
   - App SKU: `destiny-driver-v1`
   - Category: Maps & Navigation (or Business)
   - Same privacy policy URL

#### Description
   - Use Driver App descriptions from Section 5

#### Images & Multimedia
   - Use Driver App screenshots
   - Differentiated app icon

#### Binary File(s)
   - Upload the Driver App production APK

#### Testing Instructions
   ```
   Test Account Credentials:
   
   Email: reviewerdriver@destiny.com
   Password: ReviewerPass123!
   
   This account is pre-approved by admin.
   
   Testing Steps:
   1. Login with the above credentials
   2. Allow location permission
   3. Toggle the "Online" switch to go online
   4. Navigate to Earnings screen to see earnings summary
   5. Navigate to Ride History to see past rides
   6. Go to Profile → Manage Vehicles to see registered vehicles
   7. Try adding a new vehicle with test details:
      - Number: TEST-1234
      - Model: Test Car
      - Type: CAR
      - Color: White
   8. Toggle offline and check the profile screen
   
   Note: To test ride acceptance, a passenger must create a ride 
   request while the driver is online. Since this requires two 
   devices, the review can focus on the UI flows above.
   ```

---

## 10. Post-Submission

### 10.1 Review Timeline

- Amazon Appstore review typically takes **1–7 business days**
- You'll receive email notifications about approval or rejection
- If rejected, Amazon provides specific reasons and required changes

### 10.2 Common Rejection Reasons & Fixes

| Reason | Fix |
|---|---|
| App crashes on launch | Test on multiple devices; ensure API URL is production |
| Missing privacy policy | Host a publicly accessible privacy policy page |
| Insufficient app description | Expand description with detailed feature list |
| Screenshots don't match app | Take new screenshots of the current app version |
| Login required but no test credentials | Provide test account in testing instructions |
| Location permission not explained | Add clear permission usage description in app.json |
| App doesn't work without internet | Add offline error handling with retry |

### 10.3 Updating the App

After initial approval, to submit updates:

1. Increment `version` in `app.json` (e.g., `1.0.0` → `1.1.0`)
2. Increment `versionCode` (e.g., `1` → `2`)
3. Build new production APK with EAS
4. In Amazon Developer Console → select your app → "Add Upcoming Version"
5. Upload new APK and update description/screenshots if needed
6. Submit for review

### 10.4 Version Naming Convention

```text
Version format: MAJOR.MINOR.PATCH
Version code:   incrementing integer

Examples:
  1.0.0 (versionCode: 1) — Initial release
  1.0.1 (versionCode: 2) — Bug fixes
  1.1.0 (versionCode: 3) — New features
  2.0.0 (versionCode: 4) — Major update
```

---

*Document Version: 1.0*
*Project: destiny Ride-Booking Platform*

