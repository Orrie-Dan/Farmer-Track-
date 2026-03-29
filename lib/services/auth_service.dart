import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  AuthService(this._auth);

  final FirebaseAuth _auth;

  Stream<User?> authStateChanges() => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  Future<void> signIn(String email, String password) async {
    await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<void> signUp(String email, String password) async {
    await _auth.createUserWithEmailAndPassword(email: email, password: password);
  }

  Future<void> signInWithGoogle() async {
    await GoogleSignIn.instance.initialize();
    final googleUser = await GoogleSignIn.instance.authenticate();
    final auth = googleUser.authentication;
    final clientAuth = await googleUser.authorizationClient.authorizeScopes(const ['email']);

    final credential = GoogleAuthProvider.credential(
      accessToken: clientAuth.accessToken,
      idToken: auth.idToken,
    );
    await _auth.signInWithCredential(credential);
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  /// Mirrors the web app’s “Continue Offline” intent.
  ///
  /// In Flutter we use anonymous auth when online (so Firestore persistence
  /// can cache data for offline use later). If the device is fully offline and
  /// no Firebase user exists, we can’t safely write to Firestore (rules require
  /// auth). In that case we throw so UI can show a message.
  Future<void> continueOffline() async {
    final results = await Connectivity().checkConnectivity();
    final isOnline = results.any((r) => r != ConnectivityResult.none);

    if (_auth.currentUser != null) return;

    if (isOnline) {
      await _auth.signInAnonymously();
      return;
    }

    throw StateError('No internet connection. Connect once to enable offline mode.');
  }
}

