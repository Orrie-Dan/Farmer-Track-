# FarmTrack (`farmer_track`)

Flutter app for tracking farm seasons, crops, expenses, harvests, and sales with **Firebase Authentication** and **Cloud Firestore**.

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

## Project layout (high level)

- `lib/` — Flutter UI, services (`auth_service`, `firestore_service`), routing, app state
- `firestore.rules` / `firestore.indexes.json` — deploy to Firebase for production rules and indexes

## Resources

- [Flutter documentation](https://docs.flutter.dev/)
- [FlutterFire](https://firebase.flutter.dev/)
