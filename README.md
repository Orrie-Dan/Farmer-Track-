# FarmTrack (`farmer_track`)

Flutter app for tracking farm seasons, crops, expenses, harvests, and sales with **Firebase Authentication** and **Cloud Firestore**.

## Team

**Victor** · **Bianca** · **Lariisa** · **Sonia** · **Dan**

Each person below owns a slice of the repo for commits (swap roles if you prefer—just keep merge order sensible: Android + entry/routing before heavy UI changes).

| Teammate | Focus | Paths (your commit scope) |
|----------|--------|---------------------------|
| **Victor** | Docs, Flutter config, Firebase options, web stub, tests, Firestore config | `.gitignore`, `README.md`, `FIREBASE_SETUP.md`, `pubspec.yaml`, `analysis_options.yaml`, `web/index.html`, `web/manifest.json`, `lib/firebase_options.dart`, `test/widget_test.dart`, `firestore.rules`, `firestore.indexes.json` |
| **Bianca** | Android Gradle + manifests + `google-services` | `android/settings.gradle.kts`, `android/build.gradle.kts`, `android/app/build.gradle.kts`, `android/gradle.properties`, `android/gradle/wrapper/gradle-wrapper.properties`, `android/app/google-services.json`, `android/app/src/main/AndroidManifest.xml`, `android/app/src/debug/AndroidManifest.xml`, `android/app/src/profile/AndroidManifest.xml` |
| **Lariisa** | Android resources + app entry & routing shell | `android/app/src/main/kotlin/com/farmtrack/farmer_track/MainActivity.kt`, `android/app/src/main/res/values/styles.xml`, `android/app/src/main/res/values-night/styles.xml`, `android/app/src/main/res/drawable/launch_background.xml`, `android/app/src/main/res/drawable-v21/launch_background.xml`, `lib/main.dart`, `lib/router.dart`, `lib/ui/app_shell.dart` |
| **Sonia** | Models, state, services, utilities, auth & onboarding UI | `lib/models.dart`, `lib/state/app_state.dart`, `lib/services/auth_service.dart`, `lib/services/firestore_service.dart`, `lib/utils.dart`, `lib/metrics.dart`, `lib/ui/widgets/loading_view.dart`, `lib/ui/screens/login_screen.dart`, `lib/ui/screens/onboarding_screen.dart` |
| **Dan** | Theme + main feature screens | `lib/ui/theme.dart`, `lib/ui/screens/dashboard_screen.dart`, `lib/ui/screens/seasons_screen.dart`, `lib/ui/screens/season_detail_screen.dart`, `lib/ui/screens/crop_detail_screen.dart`, `lib/ui/screens/harvest_add_screen.dart`, `lib/ui/screens/sale_add_screen.dart`, `lib/ui/screens/expense_add_screen.dart`, `lib/ui/screens/settings_screen.dart` |

**Note:** `android/local.properties` is machine-specific. Do not commit it unless your instructor requires it—prefer each developer generating it locally.

## Project structure

How the repo is organized (only meaningful source and config—no `build/`, `.dart_tool/`, or generated caches):

```
farmer_track/
├── .gitignore
├── analysis_options.yaml
├── FIREBASE_SETUP.md
├── firestore.indexes.json
├── firestore.rules
├── pubspec.yaml
├── README.md
├── android/
│   ├── app/
│   │   ├── build.gradle.kts
│   │   ├── google-services.json
│   │   └── src/
│   │       ├── debug/AndroidManifest.xml
│   │       ├── main/
│   │       │   ├── AndroidManifest.xml
│   │       │   ├── kotlin/com/farmtrack/farmer_track/MainActivity.kt
│   │       │   └── res/
│   │       │       ├── drawable/launch_background.xml
│   │       │       ├── drawable-v21/launch_background.xml
│   │       │       └── values/ … values-night/ …
│   │       └── profile/AndroidManifest.xml
│   ├── build.gradle.kts
│   ├── gradle/wrapper/gradle-wrapper.properties
│   ├── gradle.properties
│   └── settings.gradle.kts
├── ios/                    # Xcode project (Flutter default; optional target)
├── lib/
│   ├── firebase_options.dart
│   ├── main.dart
│   ├── metrics.dart
│   ├── models.dart
│   ├── router.dart
│   ├── utils.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   └── firestore_service.dart
│   ├── state/
│   │   └── app_state.dart
│   └── ui/
│       ├── app_shell.dart
│       ├── theme.dart
│       ├── widgets/
│       │   └── loading_view.dart
│       └── screens/
│           ├── crop_detail_screen.dart
│           ├── dashboard_screen.dart
│           ├── expense_add_screen.dart
│           ├── harvest_add_screen.dart
│           ├── login_screen.dart
│           ├── onboarding_screen.dart
│           ├── sale_add_screen.dart
│           ├── season_detail_screen.dart
│           ├── seasons_screen.dart
│           └── settings_screen.dart
├── test/
│   └── widget_test.dart
├── web/
│   ├── index.html
│   └── manifest.json
├── windows/                # desktop target (Flutter default)
├── linux/
└── macos/
```

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable channel)
- A Firebase project (see below)

## Quick start

```bash
cd "farmer track"   # or your clone path
flutter pub get
flutter run
```

## Firebase

Configuration is **Flutter-native**: `lib/firebase_options.dart` plus platform files (`android/app/google-services.json`, `ios/Runner/GoogleService-Info.plist`, etc.). There is no Next.js-style `.env` with `NEXT_PUBLIC_*` keys in this project.

**Full steps** (new Firebase project, Auth, Firestore, rules, indexes, FlutterFire CLI): see **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**.

If you clone the repo and use your **own** Firebase project, run:

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

Then `flutter pub get` and `flutter run` again.

Deploy **`firestore.rules`** and **`firestore.indexes.json`** to your Firebase project when you move beyond local testing (see **FIREBASE_SETUP.md**).

## Resources

- [Flutter documentation](https://docs.flutter.dev/)
- [FlutterFire](https://firebase.flutter.dev/)
