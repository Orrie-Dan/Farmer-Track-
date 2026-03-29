import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../services/auth_service.dart';
import '../services/firestore_service.dart';

class AppState extends ChangeNotifier {
  AppState({
    required FirebaseAuth auth,
    required FirebaseFirestore firestore,
  })  : authService = AuthService(auth),
        firestoreService = FirestoreService(firestore);

  final AuthService authService;
  final FirestoreService firestoreService;

  User? get user => authService.currentUser;
}

