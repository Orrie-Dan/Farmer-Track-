import 'package:flutter/material.dart';

class AppTheme {
  static const brand = Color(0xFF16A34A);

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(seedColor: brand);
    return ThemeData(
      colorScheme: scheme,
      useMaterial3: true,
      scaffoldBackgroundColor: const Color(0xFFFAFAF9),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFFFAFAF9),
        foregroundColor: scheme.onSurface,
        elevation: 0,
        centerTitle: false,
      ),
    );
  }
}

