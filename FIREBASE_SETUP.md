# Firebase Setup Guide for FarmTrack (Flutter)

Follow these steps to connect the **Flutter** FarmTrack app to Firebase. This guide targets Android, iOS, and desktop/web targets that the project configures via `lib/firebase_options.dart` — not a separate web-only stack.

---

## Step 1: Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `farmtrack` (or any name you like)
4. Disable Google Analytics for now (you can enable it later)
5. Click **"Create project"** and wait for it to finish

---

## Step 2: Register Your Flutter Platforms (recommended: FlutterFire CLI)

The app initializes Firebase with `DefaultFirebaseOptions.currentPlatform` in `lib/main.dart`. The usual workflow is to **regenerate** `lib/firebase_options.dart` and native config files whenever you create or switch Firebase projects.

### Option A — FlutterFire CLI (recommended)

1. Install the CLI (once):

```bash
dart pub global activate flutterfire_cli
```

2. From the **project root** (where `pubspec.yaml` lives), run:

```bash
flutterfire configure
```

3. Sign in when prompted, pick your Firebase project, and select the platforms you use (at minimum **Android** and **iOS** for mobile; add **Web** / **Windows** if you run those targets).

4. The CLI will:

   - Update or create **`lib/firebase_options.dart`**
   - Place **`android/app/google-services.json`** (Android)
   - Place **`ios/Runner/GoogleService-Info.plist`** (iOS) when iOS is selected

5. Run **`flutter pub get`**, then **`flutter run`** on your target device or emulator.

### Option B — Firebase Console (manual)

If you prefer not to use the CLI:

1. In Firebase Console → Project settings → **Your apps**, add each platform:
   - **Android**: use the same **application ID** as in `android/app/build.gradle.kts` (`applicationId`, e.g. `com.farmtrack.farmer_track`). Download **`google-services.json`** into **`android/app/`**.
   - **iOS**: use the **bundle ID** that matches your Xcode/Flutter iOS config. Download **`GoogleService-Info.plist`** into **`ios/Runner/`**.

2. You still need a Dart-side config. Either run **`flutterfire configure`** once to generate `firebase_options.dart`, or hand-edit `lib/firebase_options.dart` to match the values from the Firebase console (error-prone; CLI is safer).

You do **not** use `.env` or `NEXT_PUBLIC_*` variables for this Flutter project; keys live in `firebase_options.dart` and the native plist/json files.

---

## Step 3: Enable Authentication

1. In the Firebase console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Under **Sign-in method**, enable these providers:

### Email/Password

- Click **"Email/Password"**
- Toggle **"Enable"** to ON
- Click **"Save"**

### Anonymous

- Click **"Anonymous"**
- Toggle **"Enable"** to ON
- Click **"Save"**

This allows the "Continue Offline" mode in the app.

### Google

- Click **"Google"**
- Toggle **"Enable"** to ON
- Choose a **support email** from the dropdown
- Click **"Save"**

For Google Sign-In on Android/iOS, follow the [FlutterFire Google Sign-In setup](https://firebase.google.com/docs/auth/flutter/federated-auth) (SHA-1/SHA-256 for Android, URL schemes for iOS) if sign-in fails after enabling the provider.

---

## Step 4: Create Cloud Firestore Database

1. In the sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll lock it down with rules)
4. Select the region closest to your users:
   - For Rwanda/East Africa: `europe-west1` (Belgium) is recommended
   - Other good options: `us-central1` or `asia-southeast1`
5. Click **"Enable"**

### Deploy Security Rules

After the database is created, go to the **"Rules"** tab and replace the default rules with the content from your **`firestore.rules`** file at the project root:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      function isOwner() {
        return request.auth != null && request.auth.uid == userId;
      }
      // ... (paste the full content from firestore.rules)
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **"Publish"** to save.

### Create Composite Indexes

The app uses compound queries (e.g. filter by `cropCycleId` and sort by date). Firestore requires **composite indexes** for these.

**Option A (automatic):** Run the app and trigger the query. When an index is missing, the **debug console** (VS Code / Android Studio) or **logcat** / **Xcode** output will print an error with a **direct link** to create the index in the Firebase console. Open the link and publish the index.

**Option B (manual via Firebase CLI):**

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:indexes
```

(Index definitions live in **`firestore.indexes.json`** at the project root.)

---

## Step 5: Run the Flutter App

1. From the project root:

```bash
flutter pub get
flutter run
```

2. Choose your device (Android emulator, physical phone, iOS simulator, etc.).

There is no separate `npm run dev` or `localhost:3000` step for this repo — it is a Flutter application.

---

## Step 6: Verify It Works

1. Launch the app with **`flutter run`** (or your IDE’s Run button).
2. Use **Get Started** → create an account or use **Continue Offline** (if your flows match).
3. Create a season, add a crop, add an expense.
4. In Firebase Console → Firestore Database → **"Data"** tab, confirm documents under `users/{your-uid}/seasons/...`.

### Test offline behavior (mobile)

1. Turn on **airplane mode** or disable Wi‑Fi/data on the device or emulator.
2. Add records in the app — they should persist locally where Firestore offline persistence is enabled.
3. Restore connectivity — pending writes should sync to Firestore when the rules and auth allow it.

---

## Firestore Data Structure Reference

```
users/
  └── {userId}/
        ├── seasons/
        │     └── {seasonId}
        │           ├── id: string
        │           ├── name: "2026 Season A"
        │           ├── startDate: "2026-02-01"
        │           ├── endDate: "2026-07-31"
        │           ├── currency: "RWF"
        │           ├── createdAt: ISO timestamp
        │           └── updatedAt: ISO timestamp
        │
        ├── crops/
        │     └── {cropId}
        │           ├── id: string
        │           ├── seasonId: → links to season
        │           ├── cropName: "Maize"
        │           ├── fieldName: "Field 1"
        │           ├── plantingDate: "2026-02-15"
        │           ├── expectedHarvestDate: "2026-06-01"
        │           ├── unit: "kg"
        │           ├── status: "planted" | "harvested" | "closed"
        │           ├── createdAt: ISO timestamp
        │           └── updatedAt: ISO timestamp
        │
        ├── expenses/
        │     └── {expenseId}
        │           ├── id: string
        │           ├── cropCycleId: → links to crop
        │           ├── seasonId: → links to season
        │           ├── category: "seed" | "fertilizer" | "labor" | ...
        │           ├── amount: 15000 (in RWF)
        │           ├── date: "2026-02-16"
        │           ├── note: "Bought 10kg NPK"
        │           └── createdAt: ISO timestamp
        │
        ├── harvests/
        │     └── {harvestId}
        │           ├── id: string
        │           ├── cropCycleId: → links to crop
        │           ├── seasonId: → links to season
        │           ├── harvestDate: "2026-06-01"
        │           ├── quantity: 200
        │           ├── unit: "kg"
        │           ├── note: "First harvest"
        │           └── createdAt: ISO timestamp
        │
        └── sales/
              └── {saleId}
                    ├── id: string
                    ├── cropCycleId: → links to crop
                    ├── seasonId: → links to season
                    ├── date: "2026-06-05"
                    ├── quantitySold: 100
                    ├── unit: "kg"
                    ├── pricePerUnit: 300
                    ├── totalPrice: 30000
                    ├── buyerType: "market" | "cooperative" | "individual"
                    ├── paymentStatus: "paid" | "unpaid" | "partial"
                    ├── buyerName: "Kigali Market" (optional)
                    └── createdAt: ISO timestamp
```

---

## Why This Structure (Not Deep Nesting)

Firestore supports subcollections like:
`users/{uid}/seasons/{sid}/crops/{cid}/expenses/{eid}`

We deliberately **don't** use deep nesting because:

1. **Cross-crop queries** — Getting "all expenses for a season" requires reading every crop first if expenses are nested inside crops
2. **Dashboard aggregation** — The profit/loss dashboard needs all expenses and sales for a season, regardless of which crop they belong to
3. **Firestore limitation** — You can't query across subcollection groups of different parents efficiently

Instead, each document carries `seasonId` and `cropCycleId` fields as "foreign keys" enabling any query pattern:

| Query | How It Works |
|-------|-------------|
| All expenses for crop X | `where("cropCycleId", "==", X)` |
| All expenses for season Y | `where("seasonId", "==", Y)` |
| All sales sorted by date | `orderBy("date", "desc")` |
| Season dashboard totals | Fetch all expenses + sales for seasonId |

---

## Composite Indexes Required

Firestore needs composite indexes for queries with both `where` and `orderBy`:

| Collection | Filter Field | Sort Field |
|-----------|-------------|------------|
| crops | seasonId | createdAt DESC |
| expenses | cropCycleId | date DESC |
| expenses | seasonId | date DESC |
| harvests | cropCycleId | harvestDate DESC |
| harvests | seasonId | harvestDate DESC |
| sales | cropCycleId | date DESC |
| sales | seasonId | date DESC |

These are defined in **`firestore.indexes.json`** and deploy with `firebase deploy --only firestore:indexes`.

---

## Security Rules Summary

The rules in **`firestore.rules`** enforce:

- **Authentication required** — No anonymous reads/writes to raw paths
- **User isolation** — Each user only accesses `/users/{their-uid}/**`
- **Data validation on create:**
  - Seasons must have a name, startDate, and currency
  - Crops must have a valid status (planted/harvested/closed)
  - Expenses must have a positive amount and valid category
  - Sales must have positive quantity, price, and valid buyer/payment types
  - Harvests must have non-negative quantity
- **Default deny** — Everything outside `/users/{uid}` is blocked

