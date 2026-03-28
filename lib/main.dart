import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';
import 'router.dart';
import 'state/app_state.dart';
import 'ui/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FirebaseFirestore.instance.settings =
      const Settings(persistenceEnabled: true);
  runApp(const FarmTrackApp());
}

class FarmTrackApp extends StatelessWidget {
  const FarmTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(
        auth: FirebaseAuth.instance,
        firestore: FirebaseFirestore.instance,
      ),
      builder: (context, _) {
        final router = createRouter(context.read<AppState>());
        return MaterialApp.router(
          title: 'FarmTrack',
          theme: AppTheme.light(),
          routerConfig: router,
        );
      },
    );
  }
}
