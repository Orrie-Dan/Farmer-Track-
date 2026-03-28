import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'dart:async';

import 'state/app_state.dart';
import 'ui/screens/crop_detail_screen.dart';
import 'ui/screens/dashboard_screen.dart';
import 'ui/screens/login_screen.dart';
import 'ui/screens/onboarding_screen.dart';
import 'ui/screens/season_detail_screen.dart';
import 'ui/screens/seasons_screen.dart';
import 'ui/screens/settings_screen.dart';
import 'ui/screens/expense_add_screen.dart';
import 'ui/screens/harvest_add_screen.dart';
import 'ui/screens/sale_add_screen.dart';
import 'ui/app_shell.dart';

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    _sub = stream.listen((_) => notifyListeners());
  }
  late final StreamSubscription<dynamic> _sub;

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

GoRouter createRouter(AppState appState) {
  final authStream = appState.authService.authStateChanges();
  final refresh = GoRouterRefreshStream(authStream);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      final user = context.read<AppState>().user;
      final isAuthRoute = state.matchedLocation == '/' || state.matchedLocation == '/login';

      if (user == null && !isAuthRoute) return '/';
      if (user != null && isAuthRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) {
          final offline = state.uri.queryParameters['mode'] == 'offline';
          return LoginScreen(triggerOffline: offline);
        },
      ),
      ShellRoute(
        builder: (context, state, child) => AppShell(
          location: state.uri.path,
          child: child,
        ),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/seasons',
            builder: (context, state) => const SeasonsScreen(),
          ),
          GoRoute(
            path: '/seasons/:id',
            builder: (context, state) =>
                SeasonDetailScreen(seasonId: state.pathParameters['id']!),
          ),
          GoRoute(
            path: '/crops/:id',
            builder: (context, state) {
              final cropId = state.pathParameters['id']!;
              final seasonId = state.uri.queryParameters['seasonId'] ?? '';
              return CropDetailScreen(cropId: cropId, seasonId: seasonId);
            },
          ),
          GoRoute(
            path: '/expenses/add',
            builder: (context, state) {
              final cropId = state.uri.queryParameters['cropId'] ?? '';
              final seasonId = state.uri.queryParameters['seasonId'] ?? '';
              return ExpenseAddScreen(seasonId: seasonId, cropId: cropId);
            },
          ),
          GoRoute(
            path: '/harvests/add',
            builder: (context, state) {
              final cropId = state.uri.queryParameters['cropId'] ?? '';
              final seasonId = state.uri.queryParameters['seasonId'] ?? '';
              return HarvestAddScreen(seasonId: seasonId, cropId: cropId);
            },
          ),
          GoRoute(
            path: '/sales/add',
            builder: (context, state) {
              final cropId = state.uri.queryParameters['cropId'] ?? '';
              final seasonId = state.uri.queryParameters['seasonId'] ?? '';
              return SaleAddScreen(seasonId: seasonId, cropId: cropId);
            },
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );
}

